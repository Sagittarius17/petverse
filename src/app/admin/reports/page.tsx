
'use client';

import { useState, useMemo, memo } from 'react';
import {
    MoreHorizontal,
    Search,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, Timestamp, doc, updateDoc } from 'firebase/firestore';
import type { UserReport } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const StatusBadge = ({ status }: { status: UserReport['status'] }) => {
    switch (status) {
        case 'Pending':
            return (
                <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
                    <Clock className="h-3 w-3" /> Pending
                </Badge>
            );
        case 'In Review':
            return (
                <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200 bg-blue-50">
                    <Search className="h-3 w-3" /> In Review
                </Badge>
            );
        case 'Resolved':
            return (
                <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="h-3 w-3" /> Resolved
                </Badge>
            );
        case 'Dismissed':
            return (
                <Badge variant="outline" className="gap-1 text-slate-500 border-slate-200 bg-slate-50">
                    <XCircle className="h-3 w-3" /> Dismissed
                </Badge>
            );
        default:
            return <Badge>{status}</Badge>;
    }
};

const ReportRow = memo(function ReportRow({ report, onUpdateStatus }: {
    report: UserReport,
    onUpdateStatus: (id: string, status: UserReport['status']) => void
}) {
    return (
        <TableRow>
            <TableCell className="font-mono text-xs text-muted-foreground">
                {report.id.substring(0, 8)}...
            </TableCell>
            <TableCell className="font-medium">{report.reporterName}</TableCell>
            <TableCell>
                <Badge variant="secondary">{report.targetType}</Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate" title={report.reason}>
                {report.reason}
            </TableCell>
            <TableCell>
                <StatusBadge status={report.status} />
            </TableCell>
            <TableCell>{formatDate(report.createdAt)}</TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="gap-2"
                            onClick={() => onUpdateStatus(report.id, 'In Review')}
                            disabled={report.status === 'In Review' || report.status === 'Resolved'}
                        >
                            <Search className="h-4 w-4" /> Mark In Review
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="gap-2 text-emerald-600 focus:text-emerald-600"
                            onClick={() => onUpdateStatus(report.id, 'Resolved')}
                            disabled={report.status === 'Resolved'}
                        >
                            <CheckCircle2 className="h-4 w-4" /> Resolve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => onUpdateStatus(report.id, 'Dismissed')}
                            disabled={report.status === 'Dismissed' || report.status === 'Resolved'}
                        >
                            <XCircle className="h-4 w-4" /> Dismiss
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
});

export default function AdminReportsPage() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');

    const reportsCollection = useMemoFirebase(() => collection(firestore, 'user_reports'), [firestore]);
    const { data: reports, isLoading } = useCollection<UserReport>(reportsCollection);

    const handleUpdateStatus = async (id: string, status: UserReport['status']) => {
        if (!firestore) return;
        const reportRef = doc(firestore, 'user_reports', id);
        try {
            await updateDoc(reportRef, {
                status,
                ...(status === 'Resolved' ? { resolvedAt: Timestamp.now() } : {})
            });
        } catch (error) {
            console.error('Error updating report status:', error);
        }
    };

    const filteredReports = useMemo(() => {
        if (!reports) return [];
        if (!searchTerm) return reports.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        const lowerSearch = searchTerm.toLowerCase();
        return reports
            .filter(report =>
                report.reporterName?.toLowerCase().includes(lowerSearch) ||
                report.reason?.toLowerCase().includes(lowerSearch) ||
                report.targetType?.toLowerCase().includes(lowerSearch) ||
                report.status?.toLowerCase().includes(lowerSearch) ||
                report.id?.toLowerCase().includes(lowerSearch)
            )
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    }, [reports, searchTerm]);

    return (
        <Card className="h-[calc(100vh_-_8rem)] flex flex-col">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle>User Reports</CardTitle>
                            <CardDescription>
                                Manage and resolve reports submitted by users regarding content or behavior.
                            </CardDescription>
                        </div>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by reporter, reason, id..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 border-t">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[80px]">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredReports.length > 0 ? (
                            filteredReports.map((report) => (
                                <ReportRow
                                    key={report.id}
                                    report={report}
                                    onUpdateStatus={handleUpdateStatus}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    {searchTerm ? `No reports found matching "${searchTerm}"` : "No user reports found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
