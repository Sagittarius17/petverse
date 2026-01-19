
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full h-16 w-16 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="mt-4 text-3xl font-headline">Thank You for Your Order!</CardTitle>
                    <CardDescription>
                        Your purchase helps support our mission to find loving homes for pets.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Your order has been successfully placed. You will receive an email confirmation shortly.
                    </p>
                    {orderId && <p className="text-sm text-muted-foreground">Order ID: #{orderId}</p>}
                    <div className="flex gap-4 justify-center pt-4">
                        <Button asChild>
                            <Link href="/shop">Continue Shopping</Link>
                        </Button>
                         <Button asChild variant="outline">
                            <Link href="/shop/order">View My Orders</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
