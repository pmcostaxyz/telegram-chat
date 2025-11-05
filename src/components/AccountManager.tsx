import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddAccountDialog from "./AddAccountDialog";
import AccountDetailsDialog from "./AccountDetailsDialog";

interface TelegramAccount {
  id: string;
  account_name: string;
  phone_number: string;
  api_id: string;
  api_hash: string;
  is_active: boolean;
  created_at: string;
}

interface AccountManagerProps {
  onAccountSelect: (accountId: string) => void;
  selectedAccountId?: string;
}

const AccountManager = ({ onAccountSelect, selectedAccountId }: AccountManagerProps) => {
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TelegramAccount | null>(null);
  const { toast } = useToast();

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("telegram_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading accounts",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAccounts(data || []);
      if (data && data.length > 0 && !selectedAccountId) {
        onAccountSelect(data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleViewDetails = (account: TelegramAccount) => {
    setSelectedAccount(account);
    setShowDetailsDialog(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    const { error } = await supabase
      .from("telegram_accounts")
      .delete()
      .eq("id", accountId);

    if (error) {
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account deleted",
        description: "Telegram account has been removed",
      });
      fetchAccounts();
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-elegant">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>Loading accounts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Telegram Accounts</CardTitle>
              <CardDescription>Manage your connected accounts</CardDescription>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="gradient"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No accounts connected</p>
              <p className="text-sm">Add your first Telegram account to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedAccountId === account.id
                      ? "border-primary bg-primary/5"
                      : "bg-card"
                  }`}
                  onClick={() => onAccountSelect(account.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{account.account_name}</p>
                      {account.is_active && (
                        <Badge className="bg-primary">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.phone_number}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(account);
                      }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAccount(account.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAccountAdded={fetchAccounts}
      />

      <AccountDetailsDialog
        account={selectedAccount}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onAccountUpdated={fetchAccounts}
      />
    </>
  );
};

export default AccountManager;
