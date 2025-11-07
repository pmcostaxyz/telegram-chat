import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeBaseManagerProps {
  knowledge: string[];
  onAddKnowledge: (text: string) => void;
}

const KnowledgeBaseManager = ({ knowledge, onAddKnowledge }: KnowledgeBaseManagerProps) => {
  const [newKnowledge, setNewKnowledge] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (newKnowledge.trim()) {
      onAddKnowledge(newKnowledge);
      setNewKnowledge("");
      toast({
        title: "Knowledge Added",
        description: "New context added to knowledge base",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Group Knowledge Base</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="knowledge">Add Context (topics, tone, key information)</Label>
          <Textarea
            id="knowledge"
            placeholder="e.g., This group discusses crypto trading, uses casual tone, focuses on Bitcoin and Ethereum..."
            value={newKnowledge}
            onChange={(e) => setNewKnowledge(e.target.value)}
            rows={4}
          />
          <Button onClick={handleAdd} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add to Knowledge Base
          </Button>
        </div>
        
        {knowledge.length > 0 && (
          <div className="space-y-2">
            <Label>Current Knowledge ({knowledge.length} items)</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {knowledge.map((item, index) => (
                <div key={index} className="p-2 bg-muted rounded text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default KnowledgeBaseManager;
