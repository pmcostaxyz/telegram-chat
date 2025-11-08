import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookTemplate, Plus, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmptyState from "./EmptyState";
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

export interface ConversationTemplate {
  id: string;
  name: string;
  steps: Array<{
    accountId: string;
    message: string;
    delay: number;
  }>;
  createdAt: string;
}

interface MessageTemplatesProps {
  templates: ConversationTemplate[];
  onSaveTemplate: (template: Omit<ConversationTemplate, "id" | "createdAt">) => void;
  onLoadTemplate: (template: ConversationTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  currentSteps?: Array<{ accountId: string; message: string; delay: number }>;
}

const MessageTemplates = ({
  templates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  currentSteps = []
}: MessageTemplatesProps) => {
  const [templateName, setTemplateName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    if (currentSteps.length === 0) {
      toast({
        title: "Error",
        description: "No conversation to save. Generate or create a conversation first.",
        variant: "destructive",
      });
      return;
    }

    onSaveTemplate({
      name: templateName,
      steps: currentSteps,
    });

    setTemplateName("");
    toast({
      title: "Template Saved",
      description: `"${templateName}" saved successfully`,
    });
  };

  const handleLoadTemplate = (template: ConversationTemplate) => {
    onLoadTemplate(template);
    toast({
      title: "Template Loaded",
      description: `"${template.name}" loaded with ${template.steps.length} messages`,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDeleteTemplate(deleteConfirm);
      setDeleteConfirm(null);
      toast({
        title: "Template Deleted",
        description: "Template removed successfully",
      });
    }
  };

  return (
    <>
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookTemplate className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Conversation Templates</CardTitle>
              <CardDescription>Save and reuse conversation patterns</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Save new template */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Save Current Conversation</Label>
            <div className="flex gap-2">
              <Input
                id="template-name"
                placeholder="Template name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                disabled={currentSteps.length === 0}
              />
              <Button 
                onClick={handleSaveTemplate}
                disabled={currentSteps.length === 0}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            {currentSteps.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {currentSteps.length} message{currentSteps.length !== 1 ? 's' : ''} in current conversation
              </p>
            )}
          </div>

          {/* Template list */}
          <div className="space-y-2">
            <Label>Saved Templates ({templates.length})</Label>
            {templates.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={BookTemplate}
                  title="No Templates Yet"
                  description="Save your first conversation template to reuse it later"
                />
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{template.name}</p>
                        <Badge variant="outline" className="shrink-0">
                          {template.steps.length} msgs
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadTemplate(template)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(template.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this template. This action cannot be undone.
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

export default MessageTemplates;
