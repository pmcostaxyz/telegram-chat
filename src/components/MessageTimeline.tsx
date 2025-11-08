import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Clock, CheckCircle2, XCircle, Search, Calendar } from "lucide-react";
import { useState } from "react";
import EmptyState from "./EmptyState";
import type { Message } from "./MessageForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MessageTimelineProps {
  messages: Message[];
  onDeleteMessage: (id: string) => void;
}

const MessageTimeline = ({ messages, onDeleteMessage }: MessageTimelineProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredMessages = messages.filter(msg => 
    msg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDeleteMessage(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No Messages Scheduled"
        description="Start by creating messages in the form above or generate AI conversations to see them here."
      />
    );
  }

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (!a.scheduledTime) return 1;
    if (!b.scheduledTime) return -1;
    return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
  });

  return (
    <>
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Message Timeline</CardTitle>
              <CardDescription>
                {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} scheduled
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            
            {sortedMessages.map((msg, index) => (
              <div
                key={msg.id}
                className="relative pl-14 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Timeline dot */}
                <div className={`absolute left-4 top-2 w-5 h-5 rounded-full border-4 border-background ${
                  msg.status === "sent" ? "bg-primary" :
                  msg.status === "failed" ? "bg-destructive" :
                  "bg-secondary"
                }`} />
                
                <div className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-hover transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {msg.status === "scheduled" && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Scheduled
                          </Badge>
                        )}
                        {msg.status === "sent" && (
                          <Badge className="gap-1 bg-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            Sent
                          </Badge>
                        )}
                        {msg.status === "failed" && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                        {msg.scheduledTime && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.scheduledTime).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">To: {msg.recipient}</p>
                      <p className="text-sm text-muted-foreground">{msg.text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(msg.id)}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scheduled message. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageTimeline;
