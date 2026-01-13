'use client';

import { useState, useMemo } from 'react';
import { Dog, Users, FileText, Heart } from 'lucide-react';
import StatsCard from '@/components/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ActivityLog from '@/components/admin/activity-log';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays } from 'date-fns';
import type { Pet } from '@/lib/data';

const data = [
    { name: 'Jan', adoptions: 4, signups: 24 },
    { name: 'Feb', adoptions: 3, signups: 13 },
    { name: 'Mar', adoptions: 5, signups: 98 },
    { name: 'Apr', adoptions: 4, signups: 39 },
    { name: 'May', adoptions: 9, signups: 48 },
    { name: 'Jun', adoptions: 7, signups: 38 },
];

export default function AdminDashboardPage() {
  const [timeFilter, setTimeFilter] = useState('30'); // Default to 30 days
  const firestore = useFirestore();

  const filterDate = useMemoFirebase(() => {
    const days = parseInt(timeFilter);
    if (isNaN(days) || days === -1) return null; // -1 for "All time"
    return subDays(new Date(), days);
  }, [timeFilter]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const usersCollection = collection(firestore, 'users');
    if (filterDate) {
      return query(usersCollection, where('createdAt', '>=', filterDate));
    }
    return usersCollection;
  }, [firestore, filterDate]);

  const blogsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const blogsCollection = collection(firestore, 'blogs');
    if (filterDate) {
      return query(blogsCollection, where('createdAt', '>=', filterDate));
    }
    return blogsCollection;
  }, [firestore, filterDate]);

  const petsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const petsCollectionRef = collection(firestore, 'pets');
    if (filterDate) {
      // Note: This requires a composite index on createdAt and isAdoptable
      // For simplicity, we filter adoptions client-side for now.
      return query(petsCollectionRef, where('createdAt', '>=', filterDate));
    }
    return petsCollectionRef;
  }, [firestore, filterDate]);

  const { data: usersData, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: blogsData, isLoading: blogsLoading } = useCollection(blogsQuery);
  const { data: petsData, isLoading: petsLoading } = useCollection<Pet>(petsQuery);

  const totalPetsCount = useMemo(() => petsData?.length ?? 0, [petsData]);
  const totalAdoptions = useMemo(() => petsData?.filter(p => !p.isAdoptable).length ?? 0, [petsData]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Admin Dashboard</h1>
        <div className="w-full sm:w-[180px]">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="15">Last 15 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="-1">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Pets" 
          value={totalPetsCount.toString()}
          icon={Dog}
          description={timeFilter === '-1' ? 'All pets registered' : `New in last ${timeFilter} days`}
          isLoading={petsLoading}
        />
        <StatsCard 
          title="New Users" 
          value={usersData?.length?.toString() ?? '0'} 
          icon={Users} 
          description={timeFilter === '-1' ? 'All time' : `In the last ${timeFilter} days`}
          isLoading={usersLoading}
        />
        <StatsCard 
          title="Blog Posts" 
          value={blogsData?.length?.toString() ?? '0'} 
          icon={FileText} 
          description={timeFilter === '-1' ? 'All time' : `In the last ${timeFilter} days`}
          isLoading={blogsLoading}
        />
        <StatsCard 
          title="Adoptions" 
          value={totalAdoptions.toString()} 
          icon={Heart} 
          description={timeFilter === '-1' ? 'All time' : `In the last ${timeFilter} days`}
          isLoading={petsLoading}
        />
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
