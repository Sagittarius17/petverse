'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Tag } from 'lucide-react';
import type { LostPetReport } from '@/lib/data';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface LostPetReportCardProps {
  report: LostPetReport;
}

export default function LostPetReportCard({ report }: LostPetReportCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="relative h-60 md:h-full">
          <Image
            src={report.petImage}
            alt={`Photo of ${report.petName}`}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        <div className="md:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-2xl font-bold font-headline">{report.petName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>Last seen: {report.lastSeenLocation}</span>
              </div>
            </div>

            {report.analysis && (
              <Alert>
                <Tag className="h-4 w-4" />
                <AlertTitle>AI-Generated Description</AlertTitle>
                <AlertDescription>
                  {report.analysis.attributeSummary}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2">Have information?</p>
                <a href={`mailto:${report.contactEmail}?subject=Information about your lost pet, ${report.petName}`}>
                    <Button className="w-full">
                        <Mail className="mr-2 h-4 w-4" /> Contact {report.ownerName}
                    </Button>
                </a>
            </div>

          </CardContent>
        </div>
      </div>
    </Card>
  );
}
