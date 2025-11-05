import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PersonalAccountSetupProps {
  onSetup: (phoneNumber: string, apiId: string, apiHash: string) => void;
  isSetup: boolean;
}

const PersonalAccountSetup = ({ onSetup, isSetup }: PersonalAccountSetupProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const { toast } = useToast();

  const handleSetup = () => {
    if (!phoneNumber.trim() || !apiId.trim() || !apiHash.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide phone number, API ID, and API Hash",
        variant: "destructive",
      });
      return;
    }

    onSetup(phoneNumber, apiId, apiHash);
    toast({
      title: "Account connected!",
      description: "You can now automate messages from your personal account",
    });
  };

  if (isSetup) {
    return (
      <Card className="bg-gradient-card shadow-elegant border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>Account Connected</CardTitle>
          </div>
          <CardDescription>Your personal Telegram account is ready</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>Connect Personal Account</CardTitle>
        </div>
        <CardDescription>
          Connect your Telegram account to automate messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Important:</strong> Automating personal accounts may violate Telegram's Terms of Service. 
            Use responsibly and avoid spam to prevent account restrictions.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="apiId">API ID</Label>
          <Input
            id="apiId"
            placeholder="12345678"
            value={apiId}
            onChange={(e) => setApiId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get from <a href="https://my.telegram.org/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">my.telegram.org/apps</a>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiHash">API Hash</Label>
          <Input
            id="apiHash"
            type="password"
            placeholder="abcdef1234567890abcdef1234567890"
            value={apiHash}
            onChange={(e) => setApiHash(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Include country code (e.g., +1 for US)
          </p>
        </div>

        <Button onClick={handleSetup} variant="gradient" className="w-full">
          Connect Account
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonalAccountSetup;
