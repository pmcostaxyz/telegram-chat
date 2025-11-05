import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const accountSchema = z.object({
  accountName: z.string().trim().min(1, { message: "Account name is required" }).max(50),
  phoneNumber: z.string().trim().min(10, { message: "Valid phone number required" }).max(20),
  apiId: z.string().trim().min(1, { message: "API ID is required" }).max(20),
  apiHash: z.string().trim().min(32, { message: "API Hash must be at least 32 characters" }).max(100),
});

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountAdded: () => void;
}

const AddAccountDialog = ({ open, onOpenChange, onAccountAdded }: AddAccountDialogProps) => {
  const [accountName, setAccountName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      accountSchema.parse({ accountName, phoneNumber, apiId, apiHash });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add accounts",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("telegram_accounts")
      .insert({
        user_id: user.id,
        account_name: accountName,
        phone_number: phoneNumber,
        api_id: apiId,
        api_hash: apiHash,
        is_active: false,
      });

    setLoading(false);

    if (error) {
      if (error.message.includes("duplicate key")) {
        toast({
          title: "Account exists",
          description: "This phone number is already registered",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error adding account",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }

    toast({
      title: "Account added!",
      description: "Your Telegram account has been connected",
    });

    // Reset form
    setAccountName("");
    setPhoneNumber("");
    setApiId("");
    setApiHash("");
    onOpenChange(false);
    onAccountAdded();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Telegram Account</DialogTitle>
          <DialogDescription>
            Connect a new personal Telegram account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
              Get API credentials from <a href="https://my.telegram.org/apps" target="_blank" rel="noopener noreferrer" className="underline">my.telegram.org/apps</a>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              placeholder="My Personal Account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiId">API ID</Label>
            <Input
              id="apiId"
              placeholder="12345678"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiHash">API Hash</Label>
            <Input
              id="apiHash"
              type="password"
              placeholder="abcdef1234567890abcdef1234567890"
              value={apiHash}
              onChange={(e) => setApiHash(e.target.value)}
              maxLength={100}
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
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1)
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="gradient"
            className="w-full"
          >
            {loading ? "Adding..." : "Add Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
