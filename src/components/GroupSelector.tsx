import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface GroupSelectorProps {
  onGroupSelect: (groupId: string, groupName: string) => void;
  selectedGroup?: { id: string; name: string };
}

const GroupSelector = ({ onGroupSelect, selectedGroup }: GroupSelectorProps) => {
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");

  const handleSelect = () => {
    if (groupId && groupName) {
      onGroupSelect(groupId, groupName);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Target Telegram Group</h3>
      </div>
      
      {selectedGroup ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Selected Group:</p>
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <div>
              <p className="font-medium">{selectedGroup.name}</p>
              <p className="text-xs text-muted-foreground">ID: {selectedGroup.id}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGroupSelect("", "")}
            >
              Change
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupId">Group ID</Label>
            <Input
              id="groupId"
              placeholder="Enter group ID"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          
          <Button onClick={handleSelect} className="w-full">
            Select Group
          </Button>
        </div>
      )}
    </Card>
  );
};

export default GroupSelector;
