import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AccountManager from "@/components/AccountManager";
import MessageForm from "@/components/MessageForm";
import MessageTimeline from "@/components/MessageTimeline";
import GroupSelector from "@/components/GroupSelector";
import KnowledgeBaseManager from "@/components/KnowledgeBaseManager";
import AIMessageGenerator from "@/components/AIMessageGenerator";
import ConversationPlanner from "@/components/ConversationPlanner";
import ConversationPreview from "@/components/ConversationPreview";
import MessageTemplates, { ConversationTemplate } from "@/components/MessageTemplates";
import DataExportImport from "@/components/DataExportImport";
import CalendarView from "@/components/CalendarView";
import ConversationAnalytics from "@/components/ConversationAnalytics";
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
    { id: "3", phone: "+1122334455" },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string }>();
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
  const [previewConversation, setPreviewConversation] = useState<Array<{
    id: string;
    accountId: string;
    accountPhone: string;
    message: string;
    delay: number;
  }>>([]);
  const [pendingAISteps, setPendingAISteps] = useState<Array<{ 
    accountId: string; 
    message: string; 
    delay: number 
  }>>([]);
  const [templates, setTemplates] = useState<ConversationTemplate[]>([]);
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

  const handleEditMessage = (id: string, text: string, recipient: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, text, recipient } : msg
    ));
    toast({
      title: "Success",
      description: "Message updated successfully",
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

  const handleConversationGenerated = (conversation: Array<{ 
    accountId: string; 
    message: string; 
    delay: number 
  }>) => {
    const preview = conversation.map((step, index) => {
      const account = accounts.find(a => a.id === step.accountId);
      return {
        id: `preview-${Date.now()}-${index}`,
        accountId: step.accountId,
        accountPhone: account?.phone || "Unknown",
        message: step.message,
        delay: step.delay,
      };
    });
    
    setPreviewConversation(preview);
    setPendingAISteps(conversation);
  };

  const handleApproveConversation = () => {
    if (pendingAISteps.length === 0) return;
    
    let cumulativeDelay = 0;
    const newMessages: Message[] = pendingAISteps.map((step, index) => {
      cumulativeDelay += step.delay;
      return {
        id: `${Date.now()}-${index}`,
        text: step.message,
        recipient: selectedGroup?.name || "Group",
        status: "scheduled" as const,
        scheduledTime: new Date(Date.now() + cumulativeDelay * 1000).toISOString(),
      };
    });
    
    setMessages([...messages, ...newMessages]);
    setPreviewConversation([]);
    setPendingAISteps([]);
    
    toast({
      title: "Conversation Scheduled",
      description: `${newMessages.length} messages scheduled`,
    });
  };

  const handleRejectConversation = () => {
    setPreviewConversation([]);
    setPendingAISteps([]);
    toast({
      title: "Conversation Cleared",
      description: "Generate a new conversation",
    });
  };

  const handlePlanSchedule = (steps: any[]) => {
    let cumulativeDelay = 0;
    const newMessages: Message[] = steps.map((step, index) => {
      cumulativeDelay += step.delay;
      return {
        id: `${Date.now()}-${index}`,
        text: step.message,
        recipient: selectedGroup?.name || "Group",
        status: "scheduled" as const,
        scheduledTime: new Date(Date.now() + cumulativeDelay * 1000).toISOString(),
      };
    });
    
    setMessages([...messages, ...newMessages]);
  };

  const handleSaveTemplate = (template: Omit<ConversationTemplate, "id" | "createdAt">) => {
    const newTemplate: ConversationTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleLoadTemplate = (template: ConversationTemplate) => {
    setPendingAISteps(template.steps);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleImportData = (importedData: any) => {
    if (importedData.messages) {
      setMessages(importedData.messages);
    }
    if (importedData.templates) {
      setTemplates(importedData.templates);
    }
    if (importedData.knowledgeBase) {
      setKnowledgeBase(importedData.knowledgeBase);
    }
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Messaging</TabsTrigger>
              <TabsTrigger value="ai">AI Conversation Simulator</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                  <MessageForm
                    onSendMessage={handleSendMessage}
                    disabled={!selectedAccountId}
                    accounts={accounts}
                  />
                  <DataExportImport
                    data={{ messages, templates, knowledgeBase }}
                    onImport={handleImportData}
                  />
                </div>
                <div className="lg:col-span-2">
                  <MessageTimeline 
                    messages={messages} 
                    onDeleteMessage={handleDeleteMessage}
                    onEditMessage={handleEditMessage}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-6">
              <GroupSelector
                onGroupSelect={handleGroupSelect}
                selectedGroup={selectedGroup}
              />
              
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                  <KnowledgeBaseManager
                    knowledge={knowledgeBase}
                    onAddKnowledge={handleAddKnowledge}
                  />
                  
                  <AIMessageGenerator
                    knowledge={knowledgeBase}
                    accounts={accounts}
                    onConversationGenerated={handleConversationGenerated}
                    disabled={!selectedGroup}
                  />

                  <MessageTemplates
                    templates={templates}
                    onSaveTemplate={handleSaveTemplate}
                    onLoadTemplate={handleLoadTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                    currentSteps={pendingAISteps}
                  />

                  <DataExportImport
                    data={{ messages, templates, knowledgeBase }}
                    onImport={handleImportData}
                  />
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                  {previewConversation.length > 0 ? (
                    <ConversationPreview
                      messages={previewConversation}
                      onApprove={handleApproveConversation}
                      onReject={handleRejectConversation}
                    />
                  ) : (
                    <ConversationPlanner
                      accounts={accounts}
                      onPlanSchedule={handlePlanSchedule}
                      aiGeneratedSteps={pendingAISteps}
                      onClearAISteps={() => setPendingAISteps([])}
                    />
                  )}
                  
                  <MessageTimeline 
                    messages={messages} 
                    onDeleteMessage={handleDeleteMessage}
                    onEditMessage={handleEditMessage}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-6">
              <CalendarView
                messages={messages}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <ConversationAnalytics
                messages={messages}
                accounts={accounts}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
