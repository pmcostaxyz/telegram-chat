import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  const [verificationCode, setVerificationCode] = useState("");
  const { toast } = useToast();

  const handleSendCode = () => {
    if (!accountId) return;

    setLoading(true);
    
    // Mock sending code
    setTimeout(() => {
      setStep("code");
      setLoading(false);
      toast({
        title: "Verification code sent",
        description: "Check your Telegram app for the code",
      });
    }, 1000);
  };

  const handleVerifyCode = () => {
    if (!accountId || !verificationCode || verificationCode.length !== 5) return;

    setLoading(true);
    
    // Mock verification
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Authentication successful!",
        description: "Your Telegram account is now active",
      });
      
      onAuthSuccess();
      onOpenChange(false);
      setStep("initial");
      setVerificationCode("");
    }, 1000);
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
