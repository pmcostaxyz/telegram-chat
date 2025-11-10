import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface BranchCondition {
  type: "time" | "account" | "status";
  operator: "equals" | "between" | "before" | "after";
  value: string;
  value2?: string; // For "between" operator
  action: "send" | "skip" | "delay";
  delayMinutes?: number;
}

export interface BranchingRules {
  enabled: boolean;
  conditions: BranchCondition[];
  defaultAction: "send" | "skip";
}

interface BranchingConditionsDialogProps {
  rules?: BranchingRules;
  accounts: Array<{ id: string; phone: string }>;
  onRulesChange: (rules: BranchingRules) => void;
}

const BranchingConditionsDialog = ({ rules, accounts, onRulesChange }: BranchingConditionsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [conditions, setConditions] = useState<BranchCondition[]>(rules?.conditions || []);
  const [defaultAction, setDefaultAction] = useState<"send" | "skip">(rules?.defaultAction || "send");

  const addCondition = () => {
    setConditions([
      ...conditions,
      { type: "time", operator: "between", value: "09:00", value2: "17:00", action: "send" },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<BranchCondition>) => {
    setConditions(conditions.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  };

  const handleSave = () => {
    const newRules: BranchingRules = {
      enabled: true,
      conditions,
      defaultAction,
    };
    onRulesChange(newRules);
    setOpen(false);
  };

  const handleDisable = () => {
    onRulesChange({ enabled: false, conditions: [], defaultAction: "send" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <GitBranch className="h-4 w-4 mr-2" />
          {rules?.enabled ? "Edit Branching" : "Add Branching"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conversation Branching</DialogTitle>
          <DialogDescription>
            Create conditional logic for message delivery
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <Card key={index}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Label className="text-sm font-semibold">Condition {index + 1}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={condition.type}
                      onValueChange={(v: any) => updateCondition(index, { type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">Time of Day</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="status">Previous Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {condition.type === "time" && (
                    <>
                      <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(v: any) => updateCondition(index, { operator: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="between">Between</SelectItem>
                            <SelectItem value="before">Before</SelectItem>
                            <SelectItem value="after">After</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                        />
                      </div>
                      {condition.operator === "between" && (
                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={condition.value2 || ""}
                            onChange={(e) => updateCondition(index, { value2: e.target.value })}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {condition.type === "account" && (
                    <div className="space-y-2">
                      <Label>Account</Label>
                      <Select
                        value={condition.value}
                        onValueChange={(v) => updateCondition(index, { value: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {condition.type === "status" && (
                    <div className="space-y-2">
                      <Label>Previous Status</Label>
                      <Select
                        value={condition.value}
                        onValueChange={(v) => updateCondition(index, { value: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select
                      value={condition.action}
                      onValueChange={(v: any) => updateCondition(index, { action: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="send">Send</SelectItem>
                        <SelectItem value="skip">Skip</SelectItem>
                        <SelectItem value="delay">Delay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {condition.action === "delay" && (
                    <div className="space-y-2">
                      <Label>Delay (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={condition.delayMinutes || 60}
                        onChange={(e) =>
                          updateCondition(index, { delayMinutes: parseInt(e.target.value) || 60 })
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addCondition} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>

          <div className="space-y-2">
            <Label>Default Action (when no conditions match)</Label>
            <Select value={defaultAction} onValueChange={(v: any) => setDefaultAction(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send">Send</SelectItem>
                <SelectItem value="skip">Skip</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Rules
            </Button>
            {rules?.enabled && (
              <Button onClick={handleDisable} variant="outline" className="flex-1">
                Disable
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BranchingConditionsDialog;
