import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  phone: string;
}

interface GeneratedConversation {
  accountId: string;
  message: string;
  delay: number;
}

interface AIMessageGeneratorProps {
  knowledge: string[];
  accounts: Account[];
  onConversationGenerated: (conversation: GeneratedConversation[]) => void;
  disabled?: boolean;
}

const AIMessageGenerator = ({ 
  knowledge, 
  accounts, 
  onConversationGenerated, 
  disabled 
}: AIMessageGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [messageCount, setMessageCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const mockAIGenerateConversation = (
    conversationTopic: string, 
    numMessages: number, 
    availableAccounts: Account[]
  ): GeneratedConversation[] => {
    const conversationTemplates = [
      { msg: `Hey, has anyone looked into ${conversationTopic}? I've been researching it lately.`, delay: 5 },
      { msg: `Yeah, I actually have some experience with ${conversationTopic}. What specifically are you interested in?`, delay: 8 },
      { msg: `I'm curious about the practical applications. Have you implemented it anywhere?`, delay: 6 },
      { msg: `Yes! I used it in a recent project. The results were quite promising. Want me to share some insights?`, delay: 10 },
      { msg: `That would be great! Also, I found this interesting approach to ${conversationTopic} that might be relevant.`, delay: 7 },
      { msg: `Interesting! Can you elaborate on that? I'm always looking for new perspectives.`, delay: 6 },
      { msg: `Sure! The key is to focus on optimization. I saw about 30% improvement using this method.`, delay: 9 },
      { msg: `That's impressive! Did you run into any challenges during implementation?`, delay: 5 },
    ];

    const conversation: GeneratedConversation[] = [];
    const numAccounts = Math.min(availableAccounts.length, 3);
    
    for (let i = 0; i < Math.min(numMessages, conversationTemplates.length); i++) {
      const accountIndex = i % numAccounts;
      conversation.push({
        accountId: availableAccounts[accountIndex].id,
        message: conversationTemplates[i].msg,
        delay: conversationTemplates[i].delay,
      });
    }

    return conversation;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a conversation topic",
        variant: "destructive",
      });
      return;
    }

    if (accounts.length < 2) {
      toast({
        title: "Error",
        description: "You need at least 2 accounts to generate a conversation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const conversation = mockAIGenerateConversation(topic, messageCount, accounts);
    onConversationGenerated(conversation);
    setIsGenerating(false);
    
    toast({
      title: "Conversation Generated",
      description: `AI created a ${conversation.length}-message conversation`,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Conversation Generator</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Conversation Topic</Label>
          <Textarea
            id="topic"
            placeholder="What should the conversation be about? e.g., 'Bitcoin price predictions for Q2'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="messageCount">Number of Messages</Label>
          <Input
            id="messageCount"
            type="number"
            min="2"
            max="8"
            value={messageCount}
            onChange={(e) => setMessageCount(Number(e.target.value))}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Generate between 2-8 messages (will alternate between your accounts)
          </p>
        </div>
        
        <Button 
          onClick={handleGenerate} 
          className="w-full"
          disabled={disabled || isGenerating || accounts.length < 2}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Conversation...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Full Conversation
            </>
          )}
        </Button>
        
        {knowledge.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Using {knowledge.length} knowledge base items to enhance conversation
          </p>
        )}

        {accounts.length < 2 && (
          <p className="text-xs text-destructive">
            Add at least 2 accounts to generate conversations
          </p>
        )}
      </div>
    </Card>
  );
};

export default AIMessageGenerator;
