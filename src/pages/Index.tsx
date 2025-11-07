import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AccountManager from "@/components/AccountManager";
import MessageForm from "@/components/MessageForm";
import MessageList from "@/components/MessageList";
import GroupSelector from "@/components/GroupSelector";
import KnowledgeBaseManager from "@/components/KnowledgeBaseManager";
import AIMessageGenerator from "@/components/AIMessageGenerator";
import ConversationPlanner from "@/components/ConversationPlanner";
import type { Message } from "@/components/MessageForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";

const Index = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [accounts, setAccounts] = useState<Array<{ id: string; phone: string }>>([
    { id: "1", phone: "+1234567890" },
    { id: "2", phone: "+0987654321" },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string }>();
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
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

  const handleGroupSelect = (groupId: string, groupName: string) => {
    if (groupId && groupName) {
      setSelectedGroup({ id: groupId, name: groupName });
    } else {
      setSelectedGroup(undefined);
    }
  };

  const handleAddKnowledge = (text: string) => {
    setKnowledgeBase([...knowledgeBase, text]);
  };

  const handleMessageGenerated = (message: string) => {
    // Auto-fill the message form or add to conversation planner
    toast({
      title: "Message Ready",
      description: "AI generated message is ready to use",
    });
  };

  const handlePlanSchedule = (steps: any[]) => {
    // Schedule all conversation steps
    const newMessages: Message[] = steps.map((step, index) => ({
      id: `${Date.now()}-${index}`,
      text: step.message,
      recipient: selectedGroup?.name || "Group",
      status: "scheduled" as const,
      scheduledTime: new Date(Date.now() + step.delay * 1000 * index).toISOString(),
    }));
    
    setMessages([...messages, ...newMessages]);
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
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Messaging</TabsTrigger>
              <TabsTrigger value="ai">AI Conversation Simulator</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <MessageForm
                  onSendMessage={handleSendMessage}
                  disabled={!selectedAccountId}
                />
                <MessageList messages={messages} onDeleteMessage={handleDeleteMessage} />
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-6">
              <GroupSelector
                onGroupSelect={handleGroupSelect}
                selectedGroup={selectedGroup}
              />
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <KnowledgeBaseManager
                    knowledge={knowledgeBase}
                    onAddKnowledge={handleAddKnowledge}
                  />
                  
                  <AIMessageGenerator
                    knowledge={knowledgeBase}
                    onMessageGenerated={handleMessageGenerated}
                    disabled={!selectedGroup}
                  />
                </div>
                
                <ConversationPlanner
                  accounts={accounts}
                  onPlanSchedule={handlePlanSchedule}
                />
              </div>
              
              <MessageList messages={messages} onDeleteMessage={handleDeleteMessage} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
