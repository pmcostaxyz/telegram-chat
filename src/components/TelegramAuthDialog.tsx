import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface TelegramAuthDialogProps {
  accountId: string | null;
  accountName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: () => void;
}

const TelegramAuthDialog = ({ accountId, accountName, open, onOpenChange, onAuthSuccess }: TelegramAuthDialogProps) => {
  const [step, setStep] = useState<"initial" | "code">("initial");
  const [loading, setLoading] = useState(false);
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!accountId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-auth', {
        body: {
          action: 'send_code',
          accountId,
        },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send verification code');
      }

      setPhoneCodeHash(data.phoneCodeHash);
      setStep("code");
      toast({
        title: "Verification code sent",
        description: "Check your Telegram app for the code",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!accountId || !verificationCode || verificationCode.length !== 5) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-auth', {
        body: {
          action: 'verify_code',
          accountId,
          phoneCode: {
            code: verificationCode,
            hash: phoneCodeHash,
          },
        },
      });

      if (error) throw error;

      if (data?.requires2FA) {
        toast({
          title: "2FA Required",
          description: "Please authenticate via the official Telegram app first",
          variant: "destructive",
        });
        return;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to verify code');
      }

      toast({
        title: "Authentication successful!",
        description: "Your Telegram account is now active",
      });
      
      onAuthSuccess();
      onOpenChange(false);
      setStep("initial");
      setVerificationCode("");
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("initial");
    setVerificationCode("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate Telegram Account</DialogTitle>
          <DialogDescription>
            {step === "initial" 
              ? `Authenticate ${accountName} to start sending messages`
              : "Enter the verification code sent to your Telegram app"
            }
          </DialogDescription>
        </DialogHeader>

        {step === "initial" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to receive a verification code in your Telegram app.
            </p>
            <Button 
              onClick={handleSendCode} 
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={5}
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <Button 
              onClick={handleVerifyCode} 
              disabled={loading || verificationCode.length !== 5}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Activate
            </Button>
            <Button 
              variant="outline"
              onClick={() => setStep("initial")}
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TelegramAuthDialog;
