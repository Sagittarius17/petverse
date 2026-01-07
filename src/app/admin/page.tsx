'use client';

import { Dog, Users, FileText, Heart } from 'lucide-react';
import StatsCard from '@/components/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ActivityLog from '@/components/admin/activity-log';
import { ScrollArea } from '@/components/ui/scroll-area';

const data = [
    { name: 'Jan', adoptions: 4, signups: 24 },
    { name: 'Feb', adoptions: 3, signups: 13 },
    { name: 'Mar', adoptions: 5, signups: 98 },
    { name: 'Apr', adoptions: 4, signups: 39 },
    { name: 'May', adoptions: 9, signups: 48 },
    { name: 'Jun', adoptions: 7, signups: 38 },
];


export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Pets" value="132" icon={Dog} description="+5 from last month" />
        <StatsCard title="New Users" value="78" icon={Users} description="+12 from last month" />
        <StatsCard title="Blog Posts" value="45" icon={FileText} description="+2 this week" />
        <StatsCard title="Adoptions" value="23" icon={Heart} description="In the last 30 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>New user signups and adoptions over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                color: "hsl(var(--foreground))"
                              }}
                            />
                            <Legend wrapperStyle={{fontSize: "14px"}} />
                            <Bar dataKey="signups" fill="hsl(var(--primary))" name="New Users" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="adoptions" fill="hsl(var(--accent))" name="Adoptions" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>A log of all administrative actions taken in the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    <ActivityLog />
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
