import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AccountManager from "@/components/AccountManager";
import MessageForm from "@/components/MessageForm";
import MessageList from "@/components/MessageList";
import type { Message } from "@/components/MessageForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const formattedMessages: Message[] = (data || []).map((msg) => ({
        id: msg.id,
        recipient: msg.recipient,
        text: msg.message_text,
        scheduledTime: msg.scheduled_time,
        status: msg.status as "scheduled" | "sent" | "failed",
      }));
      setMessages(formattedMessages);
    }
    setLoadingMessages(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSendMessage = async (message: Message) => {
    if (!user || !selectedAccountId) {
      toast({
        title: "Error",
        description: "Please select a Telegram account first",
        variant: "destructive",
      });
      return;
    }

    // If sending now, call the edge function
    if (!message.scheduledTime) {
      try {
        const { data, error } = await supabase.functions.invoke('telegram-send-message', {
          body: {
            accountId: selectedAccountId,
            recipient: message.recipient,
            message: message.text,
          },
        });

        if (error) throw error;

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to send message');
        }

        toast({
          title: "Message sent!",
          description: "Your message has been sent via Telegram",
        });

        // Save to database with sent status
        await supabase
          .from("scheduled_messages")
          .insert({
            user_id: user.id,
            telegram_account_id: selectedAccountId,
            recipient: message.recipient,
            message_text: message.text,
            scheduled_time: new Date().toISOString(),
            status: "sent",
          });

        fetchMessages();
      } catch (err: any) {
        toast({
          title: "Failed to send message",
          description: err.message || "An error occurred",
          variant: "destructive",
        });
      }
    } else {
      // Save scheduled message to database
      const { error } = await supabase
        .from("scheduled_messages")
        .insert({
          user_id: user.id,
          telegram_account_id: selectedAccountId,
          recipient: message.recipient,
          message_text: message.text,
          scheduled_time: message.scheduledTime,
          status: "scheduled",
        });

      if (error) {
        toast({
          title: "Error scheduling message",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Message scheduled!",
        description: `Will be sent at ${new Date(message.scheduledTime).toLocaleString()}`,
      });

      fetchMessages();
    }
  };

  const handleDeleteMessage = async (id: string) => {
    const { error } = await supabase
      .from("scheduled_messages")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting message",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Message deleted",
      });
      fetchMessages();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
