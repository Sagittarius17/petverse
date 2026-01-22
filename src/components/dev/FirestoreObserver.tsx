'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDevStore } from '@/lib/dev-store';
import { RefreshCw, Database } from 'lucide-react';

export default function FirestoreObserver() {
  const { reads, writes, resetCounts } = useDevStore();

  return (
    <Card className="fixed bottom-4 right-4 z-[200] w-64 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Firestore Activity
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetCounts}>
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Reset counts</span>
        </Button>
      </CardHeader>
      <CardContent className="p-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Reads:</span>
          <span className="font-bold font-mono">{reads}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Writes:</span>
          <span className="font-bold font-mono">{writes}</span>
        </div>
      </CardContent>
    </Card>
  );
}
