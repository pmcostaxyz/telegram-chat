import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataExportImportProps {
  data: {
    messages?: any[];
    templates?: any[];
    knowledgeBase?: string[];
  };
  onImport: (data: any) => void;
}

const DataExportImport = ({ data, onImport }: DataExportImportProps) => {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      ...data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `telegram-automation-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your data has been exported to a JSON file",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        onImport(importedData);
        toast({
          title: "Import Successful",
          description: "Your data has been imported successfully",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format. Please select a valid export file.",
          variant: "destructive",
        });
      } finally {
        setImporting(false);
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "Failed to read the file",
        variant: "destructive",
      });
      setImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <Card className="bg-gradient-card shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export or import your data</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Export Data</Label>
          <p className="text-sm text-muted-foreground">
            Download all your messages, templates, and knowledge base as JSON
          </p>
          <Button onClick={handleExport} className="w-full" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="import-file">Import Data</Label>
          <p className="text-sm text-muted-foreground">
            Upload a previously exported JSON file to restore your data
          </p>
          <div className="relative">
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
            <Button
              onClick={() => document.getElementById("import-file")?.click()}
              className="w-full"
              variant="outline"
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? "Importing..." : "Import Data"}
            </Button>
          </div>
        </div>

        <div className="pt-2 space-y-1 text-xs text-muted-foreground">
          <p>Current data summary:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{data.messages?.length || 0} messages</li>
            <li>{data.templates?.length || 0} templates</li>
            <li>{data.knowledgeBase?.length || 0} knowledge entries</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExportImport;
