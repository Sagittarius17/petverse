import ActivityLog from '@/components/admin/activity-log';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminActivityPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>
          A log of all administrative actions taken in the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityLog />
      </CardContent>
    </Card>
  );
}
