import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  scheduledTime?: string;
  status: "scheduled" | "sent";
}

interface MessageFormProps {
  onSendMessage: (message: Message) => void;
  disabled: boolean;
}

const MessageForm = ({ onSendMessage, disabled }: MessageFormProps) => {
  const [message, setMessage] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const { toast } = useToast();

  const handleSendNow = () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      status: "sent",
    };

    onSendMessage(newMessage);
    setMessage("");
    toast({
      title: "Message sent!",
      description: "Your message has been sent to Telegram",
    });
  };

  const handleSchedule = () => {
    if (!message.trim() || !scheduledTime) {
      toast({
        title: "Missing information",
        description: "Please enter both message and schedule time",
        variant: "destructive",
      });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      scheduledTime,
      status: "scheduled",
    };

    onSendMessage(newMessage);
    setMessage("");
    setScheduledTime("");
    toast({
      title: "Message scheduled!",
      description: `Will be sent on ${new Date(scheduledTime).toLocaleString()}`,
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
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledTime">Schedule Time (Optional)</Label>
          <Input
            id="scheduledTime"
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            disabled={disabled}
          />
        </div>
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
