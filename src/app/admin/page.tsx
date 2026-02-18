
'use client';

import { useState, useMemo } from 'react';
import { Dog, Users, FileText, Heart, AlertCircle } from 'lucide-react';
import StatsCard from '@/components/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import ActivityLog from '@/components/admin/activity-log';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, getMonth, format } from 'date-fns';
import { Pet } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface UserProfile {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt?: Timestamp;
    role?: 'User' | 'Admin' | 'Superuser' | 'Superadmin';
    status?: 'Active' | 'Inactive';
}

declare module '@/lib/data' {
    interface Pet {
        adoptedAt?: Timestamp;
    }
}


const processMonthlyData = (users: UserProfile[], pets: Pet[]) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData: { name: string; signups: number; adoptions: number }[] = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return { name: monthNames[d.getMonth()], signups: 0, adoptions: 0 };
    }).reverse();

    const sixMonthsAgo = subDays(new Date(), 180);

    users.forEach(user => {
        if (user.createdAt && user.createdAt.toDate() > sixMonthsAgo) {
            const monthIndex = getMonth(user.createdAt.toDate());
            const monthName = monthNames[monthIndex];
            const monthData = monthlyData.find(m => m.name === monthName);
            if (monthData) {
                monthData.signups += 1;
            }
        }
    });

    pets.forEach(pet => {
        // A pet is adopted if isAdoptable is false.
        // We can use adoptedAt for time-based filtering if it exists.
        if (pet.isAdoptable === false) {
            const adoptionDate = pet.adoptedAt ? pet.adoptedAt.toDate() : (pet.createdAt ? pet.createdAt.toDate() : new Date());
            if (adoptionDate > sixMonthsAgo) {
                const monthIndex = getMonth(adoptionDate);
                const monthName = monthNames[monthIndex];
                const monthData = monthlyData.find(m => m.name === monthName);
                if (monthData) {
                    monthData.adoptions += 1;
                }
            }
        }
    });

    return monthlyData;
};

const processSpeciesData = (pets: Pet[]) => {
    const speciesCount: { [key: string]: number } = {};
    pets.forEach(pet => {
        speciesCount[pet.species] = (speciesCount[pet.species] || 0) + 1;
    });
    return Object.entries(speciesCount).map(([name, value]) => ({ name, value }));
};


export default function AdminDashboardPage() {
    const [timeFilter, setTimeFilter] = useState('30'); // Default to 30 days
    const firestore = useFirestore();

    const filterDate = useMemo(() => {
        const days = parseInt(timeFilter);
        if (isNaN(days) || days === -1) return null; // -1 for "All time"
        return subDays(new Date(), days);
    }, [timeFilter]);

    const allUsersCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const usersQuery = useMemoFirebase(() => {
        if (!allUsersCollection) return null;
        if (filterDate) {
            return query(allUsersCollection, where('createdAt', '>=', filterDate));
        }
        return allUsersCollection;
    }, [allUsersCollection, filterDate]);

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
        return collection(firestore, 'pets');
    }, [firestore]);

    const { data: allUsersData, isLoading: usersLoading } = useCollection<UserProfile>(allUsersCollection);
    const { data: blogsData, isLoading: blogsLoading } = useCollection(blogsQuery);
    const { data: allPetsData, isLoading: petsLoading } = useCollection<Pet>(petsQuery);

    const reportsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'user_reports');
    }, [firestore]);
    const { data: reportsData, isLoading: reportsLoading } = useCollection(reportsQuery);

    const filteredUsers = useMemo(() => {
        if (!allUsersData || !filterDate) return allUsersData;
        return allUsersData.filter(u => u.createdAt && u.createdAt.toDate() >= filterDate);
    }, [allUsersData, filterDate]);

    const totalPetsCount = useMemo(() => allPetsData?.length ?? 0, [allPetsData]);
    const totalAdoptions = useMemo(() => allPetsData?.filter(p => p.isAdoptable === false).length ?? 0, [allPetsData]);
    const totalAvailable = useMemo(() => totalPetsCount - totalAdoptions, [totalPetsCount, totalAdoptions]);
    const pendingReports = useMemo(() => reportsData?.filter((r: any) => r.status === 'Pending').length ?? 0, [reportsData]);

    const monthlyActivityData = useMemo(() => {
        if (!allUsersData || !allPetsData) return [];
        return processMonthlyData(allUsersData, allPetsData);
    }, [allUsersData, allPetsData]);

    const speciesDistributionData = useMemo(() => {
        if (!allPetsData) return [];
        return processSpeciesData(allPetsData);
    }, [allPetsData]);

    const recentlyAdopted = useMemo(() => {
        if (!allPetsData) return [];
        return allPetsData
            .filter(p => p.isAdoptable === false)
            .sort((a, b) => {
                const timeA = a.adoptedAt?.toMillis() ?? a.createdAt?.toMillis() ?? 0;
                const timeB = b.adoptedAt?.toMillis() ?? b.createdAt?.toMillis() ?? 0;
                return timeB - timeA;
            })
            .slice(0, 5);
    }, [allPetsData]);


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

            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <StatsCard
                    title="Total Pets"
                    value={totalPetsCount.toString()}
                    icon={Dog}
                    description={timeFilter === '-1' ? 'All pets registered' : `All time`}
                    isLoading={petsLoading}
                />
                <StatsCard
                    title="New Users"
                    value={filteredUsers?.length?.toString() ?? '0'}
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
                    title="Adoption Status"
                    value={totalAdoptions.toString()}
                    valueLabel="Adopted"
                    additionalValue={totalAvailable.toString()}
                    additionalLabel="Available"
                    icon={Heart}
                    description={timeFilter === '-1' ? 'All time stats' : `All time stats`}
                    isLoading={petsLoading}
                />
                <StatsCard
                    title="User Reports"
                    value={reportsData?.length?.toString() ?? '0'}
                    valueLabel="Total"
                    additionalValue={pendingReports.toString()}
                    additionalLabel="Pending"
                    icon={AlertCircle}
                    description="Reports needing attention"
                    isLoading={reportsLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Monthly Activity</CardTitle>
                        <CardDescription>New user signups and adoptions over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyActivityData}>
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
                                    <Legend wrapperStyle={{ fontSize: "14px" }} />
                                    <Bar dataKey="signups" fill="hsl(var(--chart-1))" name="New Users" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="adoptions" fill="hsl(var(--chart-2))" name="Adoptions" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pet Species Distribution</CardTitle>
                        <CardDescription>The current breakdown of pet species in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={speciesDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={(entry) => `${entry.name} (${entry.value})`}
                                    >
                                        {speciesDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            color: "hsl(var(--foreground))"
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recently Adopted</CardTitle>
                        <CardDescription>The latest pets to find their forever homes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            {petsLoading ? (
                                <div className="space-y-4 pr-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <Skeleton className="h-5 w-20" />
                                            <Skeleton className="h-8 w-24" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4 pr-4">
                                    {recentlyAdopted.map(pet => {
                                        const image = PlaceHolderImages.find(p => p.id === pet.imageId);
                                        const adoptionDate = pet.adoptedAt ?? pet.createdAt;
                                        return (
                                            <div key={pet.id} className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={image?.imageUrl} />
                                                    <AvatarFallback>{pet.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className='flex-1'>
                                                    <p className="font-semibold">{pet.name}</p>
                                                    <p className="text-sm text-muted-foreground">{pet.breed}</p>
                                                </div>
                                                <Badge variant="secondary">
                                                    {adoptionDate ? format(adoptionDate.toDate(), 'MMM d, yyyy') : 'Recently'}
                                                </Badge>
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link href={`/profile/${pet.userId}`}>View Owner</Link>
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>
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
