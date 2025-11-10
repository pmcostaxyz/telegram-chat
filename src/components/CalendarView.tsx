import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Save, X, Repeat, GitBranch } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, startOfMonth, endOfMonth, isSameDay, parseISO } from "date-fns";
import type { Message } from "@/components/MessageForm";

interface CalendarViewProps {
  messages: Message[];
  onDeleteMessage: (id: string) => void;
  onEditMessage?: (id: string, text: string, recipient: string) => void;
}

type ViewMode = "day" | "week" | "month";

const CalendarView = ({ messages, onDeleteMessage, onEditMessage }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRecipient, setEditRecipient] = useState("");

  const scheduledMessages = messages.filter(msg => msg.status === "scheduled" && msg.scheduledTime);

  const getMessagesForDate = (date: Date) => {
    return scheduledMessages.filter(msg => {
      if (!msg.scheduledTime) return false;
      return isSameDay(parseISO(msg.scheduledTime), date);
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, direction === "next" ? 7 : -7));
    } else {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
      setCurrentDate(newDate);
    }
  };

  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.text);
    setEditRecipient(msg.recipient);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditRecipient("");
  };

  const saveEdit = () => {
    if (editingId && onEditMessage) {
      onEditMessage(editingId, editText, editRecipient);
      cancelEdit();
    }
  };

  const renderDayView = () => {
    const messagesForDay = getMessagesForDate(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>
        </div>
        <div className="space-y-2">
          {messagesForDay.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No messages scheduled for this day</p>
          ) : (
            messagesForDay.map(msg => (
              <Card key={msg.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {editingId === msg.id ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Input
                          value={editRecipient}
                          onChange={(e) => setEditRecipient(e.target.value)}
                          placeholder="Recipient"
                          className="text-sm"
                        />
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          placeholder="Message text"
                          className="text-sm min-h-[80px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {msg.scheduledTime && format(parseISO(msg.scheduledTime), "h:mm a")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">→ {msg.recipient}</span>
                          {msg.recurring?.enabled && (
                            <Badge variant="outline" className="gap-1">
                              <Repeat className="h-3 w-3" />
                              {msg.recurring.frequency}
                            </Badge>
                          )}
                          {msg.branching?.enabled && (
                            <Badge variant="outline" className="gap-1">
                              <GitBranch className="h-3 w-3" />
                              {msg.branching.conditions.length}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <div className="flex gap-1">
                        {onEditMessage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(msg)}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteMessage(msg.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const messagesForDay = getMessagesForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Card key={day.toISOString()} className={isToday ? "border-primary" : ""}>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm text-center">
                    {format(day, "EEE d")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {messagesForDay.map(msg => (
                    <div
                      key={msg.id}
                      className="text-xs p-2 bg-primary/10 rounded cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => onDeleteMessage(msg.id)}
                    >
                      <div className="font-medium truncate">{msg.recipient}</div>
                      <div className="text-muted-foreground">
                        {msg.scheduledTime && format(parseISO(msg.scheduledTime), "h:mm a")}
                      </div>
                    </div>
                  ))}
                  {messagesForDay.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-2">No messages</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h3>
        </div>
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => date && setCurrentDate(date)}
          className="rounded-md border"
          modifiers={{
            scheduled: scheduledMessages.map(msg => msg.scheduledTime ? parseISO(msg.scheduledTime) : new Date())
          }}
          modifiersStyles={{
            scheduled: { 
              fontWeight: "bold",
              backgroundColor: "hsl(var(--primary) / 0.1)",
            }
          }}
        />
        <div className="space-y-2">
          <h4 className="font-semibold">Messages for {format(currentDate, "MMM d, yyyy")}:</h4>
          {getMessagesForDate(currentDate).map(msg => (
            <Card key={msg.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                {editingId === msg.id ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Input
                        value={editRecipient}
                        onChange={(e) => setEditRecipient(e.target.value)}
                        placeholder="Recipient"
                        className="text-sm"
                      />
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Message text"
                        className="text-sm min-h-[60px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {msg.scheduledTime && format(parseISO(msg.scheduledTime), "h:mm a")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">→ {msg.recipient}</span>
                        {msg.recurring?.enabled && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Repeat className="h-2 w-2" />
                            {msg.recurring.frequency}
                          </Badge>
                        )}
                        {msg.branching?.enabled && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <GitBranch className="h-2 w-2" />
                            {msg.branching.conditions.length}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <div className="flex gap-1">
                      {onEditMessage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(msg)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteMessage(msg.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {getMessagesForDate(currentDate).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No messages scheduled</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border">
              {(["day", "week", "month"] as ViewMode[]).map(mode => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "day" && renderDayView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "month" && renderMonthView()}
      </CardContent>
    </Card>
  );
};

export default CalendarView;
