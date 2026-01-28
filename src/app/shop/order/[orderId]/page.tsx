'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/localization';
import { Package, Truck, Home, XCircle, ChevronLeft, Copy } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Address {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  paymentMethod: string;
  razorpayPaymentId: string;
  status: 'Placed' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: Timestamp;
  shippingAddress: Address;
}

const statusTimeline = [
    { status: 'Placed', icon: Package, text: 'Order was placed' },
    { status: 'Shipped', icon: Truck, text: 'Order has been shipped' },
    { status: 'Delivered', icon: Home, text: 'Order has been delivered' },
];

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const orderDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'orders', params.orderId);
    }, [user, firestore, params.orderId]);

    const { data: order, isLoading } = useDoc<Order>(orderDocRef);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied to Clipboard',
            description: `${label} has been copied.`,
        });
    }

    const currentStatusIndex = order ? statusTimeline.findIndex(s => s.status === order.status) : -1;

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!order) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold">Order Not Found</h1>
                <p className="text-muted-foreground mt-2">We couldn't find an order with that ID.</p>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/shop/order">Back to My Orders</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Button asChild variant="ghost" className="mb-4 -ml-4">
                <Link href="/shop/order"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Orders</Link>
            </Button>
            <div className="flex justify-between items-start mb-6">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">Order Details</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>ID: {order.id}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(order.id, 'Order ID')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>
                 <Badge variant={order.status === 'Cancelled' ? 'destructive' : 'default'} className="text-base">{order.status}</Badge>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Order Timeline</CardTitle></CardHeader>
                        <CardContent>
                            <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">                  
                               {statusTimeline.map((item, index) => {
                                   const Icon = item.icon;
                                   const isActive = index <= currentStatusIndex;
                                   return (
                                     <li key={item.status} className="mb-10 ml-6 last:mb-0">            
                                        <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-8 ring-background ${isActive ? 'bg-green-200 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                                            <Icon className="w-4 h-4" />
                                        </span>
                                        <h3 className={`font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{item.text}</h3>
                                        {index === 0 && <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">on {order.orderDate.toDate().toLocaleDateString()}</time>}
                                    </li>
                                   )
                               })}
                            </ol>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle>Items Ordered</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p>{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-1">
                            <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.streetAddress}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Payment Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="pt-2 text-xs text-muted-foreground">Paid via {order.paymentMethod}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
