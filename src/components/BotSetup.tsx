import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BotSetupProps {
  onSetup: (token: string, chatId: string) => void;
  isSetup: boolean;
}

const BotSetup = ({ onSetup, isSetup }: BotSetupProps) => {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const { toast } = useToast();

  const handleSetup = () => {
    if (!botToken.trim() || !chatId.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both bot token and chat ID",
        variant: "destructive",
      });
      return;
    }

    onSetup(botToken, chatId);
    toast({
      title: "Bot connected!",
      description: "You can now send automated messages",
    });
  };

  if (isSetup) {
    return (
      <Card className="bg-gradient-card shadow-elegant border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>Bot Connected</CardTitle>
          </div>
          <CardDescription>Your Telegram bot is ready to send messages</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>Connect Telegram Bot</CardTitle>
        </div>
        <CardDescription>
          Enter your Telegram bot token and chat ID to start automating messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="botToken">Bot Token</Label>
          <Input
            id="botToken"
            type="password"
            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chatId">Chat ID</Label>
          <Input
            id="chatId"
            placeholder="123456789"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
          />
        </div>
        <Button onClick={handleSetup} variant="gradient" className="w-full">
          Connect Bot
        </Button>
      </CardContent>
    </Card>
  );
};

export default BotSetup;
