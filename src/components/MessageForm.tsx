import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import RecurringScheduleDialog from "./RecurringScheduleDialog";
import BranchingConditionsDialog from "./BranchingConditionsDialog";
import type { RecurringSchedule, BranchingRules } from "./RecurringScheduleDialog";

interface Message {
  id: string;
  text: string;
  recipient: string;
  scheduledTime?: string;
  status: "scheduled" | "sent" | "failed";
  recurring?: RecurringSchedule;
  branching?: BranchingRules;
}

interface MessageFormProps {
  onSendMessage: (message: Message) => void;
  disabled: boolean;
  accounts?: Array<{ id: string; phone: string }>;
}

const messageSchema = z.object({
  message: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(4096, { message: "Message must be less than 4096 characters" }),
  recipient: z.string()
    .trim()
    .min(1, { message: "Recipient cannot be empty" })
    .max(100, { message: "Recipient must be less than 100 characters" }),
  scheduledTime: z.string().optional(),
});

const MessageForm = ({ onSendMessage, disabled, accounts = [] }: MessageFormProps) => {
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [recurring, setRecurring] = useState<RecurringSchedule>();
  const [branching, setBranching] = useState<BranchingRules>();
  const { toast } = useToast();

  const handleSendNow = () => {
    try {
      messageSchema.parse({ message, recipient, scheduledTime: undefined });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      recipient,
      status: "sent",
    };

    onSendMessage(newMessage);
    setMessage("");
    setRecipient("");
    toast({
      title: "Message sent!",
      description: "Your message has been sent to Telegram",
    });
  };

  const handleSchedule = () => {
    try {
      messageSchema.parse({ message, recipient, scheduledTime });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    if (!scheduledTime) {
      toast({
        title: "Missing schedule time",
        description: "Please select when to send the message",
        variant: "destructive",
      });
      return;
    }

    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate <= new Date()) {
      toast({
        title: "Invalid time",
        description: "Schedule time must be in the future",
        variant: "destructive",
      });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      recipient,
      scheduledTime,
      status: "scheduled",
      recurring,
      branching,
    };

    onSendMessage(newMessage);
    setMessage("");
    setRecipient("");
    setScheduledTime("");
    setRecurring(undefined);
    setBranching(undefined);
    toast({
      title: "Message scheduled!",
      description: `Will be sent on ${scheduledDate.toLocaleString()}`,
    });
  };

  return (
    <Card className="bg-gradient-card shadow-elegant">
      <CardHeader>
        <CardTitle>Create Message</CardTitle>
        <CardDescription>Send instantly or schedule for later</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient</Label>
          <Input
            id="recipient"
            placeholder="@username or phone number"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={disabled}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            Enter username (with @) or phone number with country code
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            disabled={disabled}
            maxLength={4096}
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/4096 characters
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledTime">Schedule Time (Optional)</Label>
          <Input
            id="scheduledTime"
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            disabled={disabled}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
        
        {scheduledTime && (
          <div className="grid grid-cols-2 gap-2">
            <RecurringScheduleDialog
              schedule={recurring}
              onScheduleChange={setRecurring}
            />
            <BranchingConditionsDialog
              rules={branching}
              accounts={accounts}
              onRulesChange={setBranching}
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={handleSendNow}
            disabled={disabled}
            variant="gradient"
            className="flex-1"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Now
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={disabled}
            variant="secondary"
            className="flex-1"
          >
            <Clock className="mr-2 h-4 w-4" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageForm;
export type { Message };
