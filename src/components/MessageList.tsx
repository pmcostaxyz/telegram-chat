import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, CheckCircle2 } from "lucide-react";
import type { Message } from "./MessageForm";

interface MessageListProps {
  messages: Message[];
  onDeleteMessage: (id: string) => void;
}

const MessageList = ({ messages, onDeleteMessage }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-elegant">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Create your first automated message above</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-elegant">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>View and manage your messages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {msg.status === "scheduled" ? (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Scheduled
                  </Badge>
                ) : (
                  <Badge className="gap-1 bg-primary">
                    <CheckCircle2 className="h-3 w-3" />
                    Sent
                  </Badge>
                )}
                {msg.scheduledTime && (
                  <span className="text-sm text-muted-foreground">
                    {new Date(msg.scheduledTime).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">To: {msg.recipient}</p>
              <p className="text-sm text-muted-foreground">{msg.text}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteMessage(msg.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MessageList;
