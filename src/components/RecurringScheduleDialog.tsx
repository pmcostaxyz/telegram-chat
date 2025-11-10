import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Repeat } from "lucide-react";

export interface RecurringSchedule {
  enabled: boolean;
  frequency: "daily" | "weekly" | "custom";
  interval?: number; // For custom frequency (in hours)
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  endDate?: string;
}

export interface BranchCondition {
  type: "time" | "account" | "status";
  operator: "equals" | "between" | "before" | "after";
  value: string;
  value2?: string;
  action: "send" | "skip" | "delay";
  delayMinutes?: number;
}

export interface BranchingRules {
  enabled: boolean;
  conditions: BranchCondition[];
  defaultAction: "send" | "skip";
}

interface RecurringScheduleDialogProps {
  schedule?: RecurringSchedule;
  onScheduleChange: (schedule: RecurringSchedule) => void;
}

const RecurringScheduleDialog = ({ schedule, onScheduleChange }: RecurringScheduleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">(schedule?.frequency || "daily");
  const [interval, setInterval] = useState(schedule?.interval || 24);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(schedule?.daysOfWeek || []);
  const [endDate, setEndDate] = useState(schedule?.endDate || "");

  const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    const newSchedule: RecurringSchedule = {
      enabled: true,
      frequency,
      interval: frequency === "custom" ? interval : undefined,
      daysOfWeek: frequency === "weekly" ? daysOfWeek : undefined,
      endDate: endDate || undefined,
    };
    onScheduleChange(newSchedule);
    setOpen(false);
  };

  const handleDisable = () => {
    onScheduleChange({ enabled: false, frequency: "daily" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Repeat className="h-4 w-4 mr-2" />
          {schedule?.enabled ? "Edit Recurring" : "Make Recurring"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recurring Schedule</DialogTitle>
          <DialogDescription>
            Set up automated message repetition
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom Interval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "custom" && (
            <div className="space-y-2">
              <Label>Interval (hours)</Label>
              <Input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              />
            </div>
          )}

          {frequency === "weekly" && (
            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="flex gap-2">
                {daysMap.map((day, index) => (
                  <Button
                    key={day}
                    variant={daysOfWeek.includes(index) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(index)}
                    className="flex-1"
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Schedule
            </Button>
            {schedule?.enabled && (
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

export default RecurringScheduleDialog;
