import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AccountManager from "@/components/AccountManager";
import MessageForm from "@/components/MessageForm";
import MessageList from "@/components/MessageList";
import type { Message } from "@/components/MessageForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    navigate("/auth");
  };

  const handleSendMessage = (message: Message) => {
    if (!selectedAccountId) {
      toast({
        title: "Error",
        description: "Please select a Telegram account first",
        variant: "destructive",
      });
      return;
    }

    // Add message to local state
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      status: message.scheduledTime ? "scheduled" : "sent",
    };

    setMessages([...messages, newMessage]);

    toast({
      title: "Success",
      description: message.scheduledTime 
        ? "Message scheduled successfully"
        : "Message sent successfully",
    });
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(msg => msg.id !== id));
    toast({
      title: "Success",
      description: "Message deleted successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <AccountManager
            onAccountSelect={setSelectedAccountId}
            selectedAccountId={selectedAccountId}
          />
          
          <div className="grid gap-6 md:grid-cols-2">
            <MessageForm
              onSendMessage={handleSendMessage}
              disabled={!selectedAccountId}
            />
            <MessageList messages={messages} onDeleteMessage={handleDeleteMessage} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
