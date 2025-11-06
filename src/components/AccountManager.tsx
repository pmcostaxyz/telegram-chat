import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddAccountDialog from "./AddAccountDialog";
import AccountDetailsDialog from "./AccountDetailsDialog";
import TelegramAuthDialog from "./TelegramAuthDialog";

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
  onAccountSelect: (accountId: string | undefined) => void;
  selectedAccountId?: string;
}

const AccountManager = ({ onAccountSelect, selectedAccountId }: AccountManagerProps) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TelegramAccount | null>(null);

  const handleViewDetails = (account: TelegramAccount) => {
    setSelectedAccount(account);
    setShowDetailsDialog(true);
  };

  const handleActivateAccount = (account: TelegramAccount) => {
    setSelectedAccount(account);
    setShowAuthDialog(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(accounts.filter(acc => acc.id !== accountId));
    if (selectedAccountId === accountId) {
      onAccountSelect(undefined);
    }
    toast({
      title: "Account deleted",
      description: "The account has been removed",
    });
  };

  const handleSelectAccount = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account && !account.is_active) {
      toast({
        title: "Account not active",
        description: "Please activate the account first",
        variant: "destructive",
      });
      return;
    }
    onAccountSelect(accountId);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Telegram Accounts</CardTitle>
              <CardDescription>Manage your connected accounts</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm" variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No accounts connected</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-md ${
                    selectedAccountId === account.id
                      ? 'border-primary bg-primary/5'
                      : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{account.account_name}</h3>
                        {account.is_active ? (
                          <Badge className="bg-primary">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{account.phone_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {account.is_active ? (
                        <Button
                          onClick={() => handleSelectAccount(account.id)}
                          size="sm"
                          variant={selectedAccountId === account.id ? "default" : "outline"}
                        >
                          {selectedAccountId === account.id ? "Selected" : "Select"}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleActivateAccount(account)}
                          size="sm"
                          variant="outline"
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        onClick={() => handleViewDetails(account)}
                        size="icon"
                        variant="ghost"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteAccount(account.id)}
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
        onAccountAdded={(newAccount) => setAccounts([...accounts, newAccount])}
      />

      {selectedAccount && (
        <>
          <AccountDetailsDialog
            account={selectedAccount}
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            onAccountUpdated={(updatedAccount) => {
              setAccounts(accounts.map(acc => 
                acc.id === updatedAccount.id ? updatedAccount : acc
              ));
            }}
          />
          <TelegramAuthDialog
            accountId={selectedAccount.id}
            accountName={selectedAccount.account_name}
            open={showAuthDialog}
            onOpenChange={setShowAuthDialog}
            onAuthSuccess={() => {
              setAccounts(accounts.map(acc => 
                acc.id === selectedAccount.id ? { ...acc, is_active: true } : acc
              ));
              toast({
                title: "Account activated",
                description: "You can now use this account to send messages",
              });
            }}
          />
        </>
      )}
    </div>
  );
};

export default AccountManager;
