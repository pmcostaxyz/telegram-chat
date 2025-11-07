import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Trash2, Clock, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ConversationStep {
  id: string;
  accountId: string;
  message: string;
  delay: number;
}

interface ConversationPlannerProps {
  accounts: Array<{ id: string; phone: string }>;
  onPlanSchedule: (steps: ConversationStep[]) => void;
  aiGeneratedSteps?: Array<{ accountId: string; message: string; delay: number }>;
  onClearAISteps?: () => void;
}

const ConversationPlanner = ({ 
  accounts, 
  onPlanSchedule, 
  aiGeneratedSteps,
  onClearAISteps 
}: ConversationPlannerProps) => {
  const [conversationSteps, setConversationSteps] = useState<ConversationStep[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentDelay, setCurrentDelay] = useState(5);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (aiGeneratedSteps && aiGeneratedSteps.length > 0) {
      const steps: ConversationStep[] = aiGeneratedSteps.map((step, index) => ({
        id: `ai-${Date.now()}-${index}`,
        accountId: step.accountId,
        message: step.message,
        delay: step.delay,
      }));
      setConversationSteps(steps);
    }
  }, [aiGeneratedSteps]);

  const handleAddStep = () => {
    if (!selectedAccountId || !currentMessage.trim()) {
      toast({
        title: "Error",
        description: "Please select an account and enter a message",
        variant: "destructive",
      });
      return;
    }

    const newStep: ConversationStep = {
      id: Date.now().toString(),
      accountId: selectedAccountId,
      message: currentMessage,
      delay: currentDelay,
    };

    setConversationSteps([...conversationSteps, newStep]);
    setCurrentMessage("");
    setCurrentDelay(5);
    
    toast({
      title: "Step Added",
      description: "Message added to conversation",
    });
  };

  const handleRemoveStep = (id: string) => {
    setConversationSteps(conversationSteps.filter(step => step.id !== id));
  };

  const handleSchedulePlan = () => {
    if (conversationSteps.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one message to the conversation",
        variant: "destructive",
      });
      return;
    }

    onPlanSchedule(conversationSteps);
    setConversationSteps([]);
    onClearAISteps?.();
    
    toast({
      title: "Conversation Scheduled",
      description: `${conversationSteps.length} messages scheduled`,
    });
  };

  const handleClear = () => {
    setConversationSteps([]);
    onClearAISteps?.();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Conversation Builder</h3>
        </div>
        {conversationSteps.length > 0 && conversationSteps[0]?.id.startsWith('ai-') && (
          <Badge variant="secondary" className="gap-1">
            <Wand2 className="h-3 w-3" />
            AI Generated
          </Badge>
        )}
      </div>
      
      <div className="space-y-4">
        {conversationSteps.length === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="account">Select Account</Label>
              <select
                id="account"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                <option value="">Choose account...</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.phone}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                placeholder="Enter message manually"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delay">Delay (seconds)</Label>
              <Input
                id="delay"
                type="number"
                min="1"
                value={currentDelay}
                onChange={(e) => setCurrentDelay(Number(e.target.value))}
              />
            </div>
            
            <Button onClick={handleAddStep} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Message Manually
            </Button>
          </>
        )}
        
        {conversationSteps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Conversation Flow ({conversationSteps.length} messages)</Label>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {conversationSteps.map((step, index) => {
                const account = accounts.find(a => a.id === step.accountId);
                return (
                  <div key={step.id} className="p-3 bg-muted rounded-md space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="text-xs font-medium">{account?.phone}</span>
                        </div>
                        <p className="text-sm">{step.message}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{step.delay}s delay</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStep(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Button onClick={handleSchedulePlan} className="w-full">
              Schedule Conversation
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConversationPlanner;
