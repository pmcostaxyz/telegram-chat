import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Check, X } from "lucide-react";

interface ConversationMessage {
  id: string;
  accountId: string;
  accountPhone: string;
  message: string;
  delay: number;
}

interface ConversationPreviewProps {
  messages: ConversationMessage[];
  onApprove: () => void;
  onReject: () => void;
}

const ConversationPreview = ({ messages, onApprove, onReject }: ConversationPreviewProps) => {
  if (messages.length === 0) return null;

  let cumulativeTime = 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Conversation Preview</h3>
          <Badge variant="outline">{messages.length} messages</Badge>
        </div>
      </div>

      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            cumulativeTime += msg.delay;
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] space-y-1 ${isEven ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{msg.accountPhone}</span>
                    <span>•</span>
                    <span>{cumulativeTime}s</span>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isEven
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex gap-3 mt-4">
        <Button onClick={onReject} variant="outline" className="flex-1">
          <X className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        <Button onClick={onApprove} className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          Schedule Conversation
        </Button>
      </div>
    </Card>
  );
};

export default ConversationPreview;
