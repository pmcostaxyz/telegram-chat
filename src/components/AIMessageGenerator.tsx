import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIMessageGeneratorProps {
  knowledge: string[];
  onMessageGenerated: (message: string) => void;
  disabled?: boolean;
}

const AIMessageGenerator = ({ knowledge, onMessageGenerated, disabled }: AIMessageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const mockAIGenerate = (userPrompt: string): string => {
    const templates = [
      `Based on ${userPrompt}, I think we should consider the market dynamics here. What do you all think?`,
      `Interesting point about ${userPrompt}. I've been researching this and found some compelling data.`,
      `${userPrompt} is definitely worth discussing. Has anyone tried implementing this approach?`,
      `Great topic! Regarding ${userPrompt}, I have some insights from my recent experience.`,
      `I've been following ${userPrompt} closely. The recent developments are quite promising.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const message = mockAIGenerate(prompt);
    setGeneratedMessage(message);
    setIsGenerating(false);
    
    toast({
      title: "Message Generated",
      description: "AI has created a message based on your prompt",
    });
  };

  const handleUseMessage = () => {
    if (generatedMessage) {
      onMessageGenerated(generatedMessage);
      setGeneratedMessage("");
      setPrompt("");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Message Generator</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Message Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="What should the AI message be about? e.g., 'price analysis for BTC'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={disabled}
          />
        </div>
        
        <Button 
          onClick={handleGenerate} 
          className="w-full"
          disabled={disabled || isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Message
            </>
          )}
        </Button>
        
        {generatedMessage && (
          <div className="space-y-2">
            <Label>Generated Message</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">{generatedMessage}</p>
            </div>
            <Button onClick={handleUseMessage} variant="secondary" className="w-full">
              Use This Message
            </Button>
          </div>
        )}
        
        {knowledge.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Add knowledge base context to improve AI message generation
          </p>
        )}
      </div>
    </Card>
  );
};

export default AIMessageGenerator;
