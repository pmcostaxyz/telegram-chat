import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface TelegramAccount {
  id: string;
  account_name: string;
  phone_number: string;
  api_id: string;
  api_hash: string;
  is_active: boolean;
  created_at: string;
}

interface AccountDetailsDialogProps {
  account: TelegramAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountUpdated: () => void;
}

const AccountDetailsDialog = ({ account, open, onOpenChange, onAccountUpdated }: AccountDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_name: "",
    phone_number: "",
    api_id: "",
    api_hash: "",
  });
  const { toast } = useToast();

  const handleEdit = () => {
    if (account) {
      setFormData({
        account_name: account.account_name,
        phone_number: account.phone_number,
        api_id: account.api_id,
        api_hash: account.api_hash,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      account_name: "",
      phone_number: "",
      api_id: "",
      api_hash: "",
    });
  };

  const handleSave = async () => {
    if (!account) return;

    setLoading(true);
    const { error } = await supabase
      .from("telegram_accounts")
      .update({
        account_name: formData.account_name,
        phone_number: formData.phone_number,
        api_id: formData.api_id,
        api_hash: formData.api_hash,
      })
      .eq("id", account.id);

    if (error) {
      toast({
        title: "Error updating account",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account updated",
        description: "Account details have been saved",
      });
      setIsEditing(false);
      onAccountUpdated();
    }
    setLoading(false);
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Account Details</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit account information" : "View account information"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name</Label>
            {isEditing ? (
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium">{account.account_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium">{account.phone_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_id">API ID</Label>
            {isEditing ? (
              <Input
                id="api_id"
                value={formData.api_id}
                onChange={(e) => setFormData({ ...formData, api_id: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium font-mono">{account.api_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_hash">API Hash</Label>
            {isEditing ? (
              <Input
                id="api_hash"
                value={formData.api_hash}
                onChange={(e) => setFormData({ ...formData, api_hash: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium font-mono">{account.api_hash}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div>
              {account.is_active ? (
                <Badge className="bg-primary">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Created At</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(account.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleEdit}>Edit</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailsDialog;
