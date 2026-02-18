
'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { UserReport } from '@/lib/data';

interface ReportDialogProps {
    targetId: string;
    targetType: UserReport['targetType'];
    targetName: string;
    isOpen: boolean;
    onClose: () => void;
}

const REASONS: { label: string; value: UserReport['reason'] }[] = [
    { label: 'Abuse or Cruelty', value: 'Abuse' },
    { label: 'Inappropriate Content', value: 'Inappropriate Content' },
    { label: 'Spam or Misleading', value: 'Spam' },
    { label: 'Information is already resolved/adopted', value: 'Resolved Information' },
    { label: 'Other', value: 'Other' },
];

export default function ReportDialog({
    targetId,
    targetType,
    targetName,
    isOpen,
    onClose
}: ReportDialogProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [reason, setReason] = useState<UserReport['reason']>('Abuse');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Authentication required',
                description: 'You must be logged in to submit a report.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(firestore, 'user_reports'), {
                reporterId: user.uid,
                reporterName: user.displayName || user.email || 'Anonymous',
                targetId,
                targetType,
                reason,
                description,
                status: 'Pending',
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Report Submitted',
                description: 'Thank you for helping us keep PetVerse safe. Our team will review this report shortly.',
            });

            // Reset and close
            setDescription('');
            setReason('Abuse');
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'There was an error submitting your report. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <DialogTitle>Report {targetType}</DialogTitle>
                    </div>
                    <DialogDescription>
                        You are reporting <strong>{targetName}</strong>. Please select the reason that best describes your concern.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <Label>Violation Type</Label>
                        <RadioGroup
                            value={reason}
                            onValueChange={(v) => setReason(v as UserReport['reason'])}
                            className="grid gap-3"
                        >
                            {REASONS.map((r) => (
                                <div key={r.value} className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value={r.value} id={r.value} className="mt-1" />
                                    <Label htmlFor={r.value} className="font-normal leading-tight h-auto cursor-pointer">
                                        {r.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Additional Details (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Please provide any additional details that might help us investigate..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
