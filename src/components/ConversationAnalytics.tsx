import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { MessageSquare, Clock, TrendingUp, Users } from "lucide-react";
import type { Message } from "@/components/MessageForm";
import { format, parseISO, getHours, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

interface ConversationAnalyticsProps {
  messages: Message[];
  accounts: Array<{ id: string; phone: string }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const ConversationAnalytics = ({ messages, accounts }: ConversationAnalyticsProps) => {
  // Total messages by status
  const statusCounts = {
    sent: messages.filter(m => m.status === "sent").length,
    scheduled: messages.filter(m => m.status === "scheduled").length,
    failed: messages.filter(m => m.status === "failed").length,
  };

  // Peak messaging hours
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    count: 0,
  }));

  messages.forEach(msg => {
    if (msg.scheduledTime) {
      const hour = getHours(parseISO(msg.scheduledTime));
      hourlyData[hour].count++;
    }
  });

  const peakHours = [...hourlyData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .filter(h => h.count > 0);

  // Messages by day of week
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyData = daysOfWeek.map(day => ({
    day: format(day, "EEE"),
    count: messages.filter(msg => 
      msg.scheduledTime && isSameDay(parseISO(msg.scheduledTime), day)
    ).length,
  }));

  // Most active accounts (mock data - in real app would track by account)
  const accountActivity = accounts.map(account => ({
    name: account.phone,
    messages: Math.floor(Math.random() * messages.length),
  })).sort((a, b) => b.messages - a.messages);

  // Status distribution for pie chart
  const statusData = [
    { name: "Sent", value: statusCounts.sent },
    { name: "Scheduled", value: statusCounts.scheduled },
    { name: "Failed", value: statusCounts.failed },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">
              {statusCounts.scheduled} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.length > 0 
                ? Math.round((statusCounts.sent / messages.length) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {statusCounts.sent} sent successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {peakHours.length > 0 ? peakHours[0].hour : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {peakHours.length > 0 ? `${peakHours[0].count} messages` : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {accountActivity.length > 0 ? `Top: ${accountActivity[0].name}` : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No message data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule Pattern</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))"
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hourly Message Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                interval={2}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Active Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accountActivity.slice(0, 5).map((account, index) => (
              <div key={account.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{account.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${accountActivity.length > 0 ? (account.messages / accountActivity[0].messages) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {account.messages} msgs
                  </span>
                </div>
              </div>
            ))}
            {accountActivity.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No account activity data</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationAnalytics;
