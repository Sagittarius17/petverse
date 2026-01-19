'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/localization';
import { Package, Truck, Home, XCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
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
}

const statusMap = {
  Placed: { value: 25, icon: <Package className="h-5 w-5" />, color: 'bg-blue-500' },
  Shipped: { value: 65, icon: <Truck className="h-5 w-5" />, color: 'bg-yellow-500' },
  Delivered: { value: 100, icon: <Home className="h-5 w-5" />, color: 'bg-green-500' },
  Cancelled: { value: 100, icon: <XCircle className="h-5 w-5" />, color: 'bg-red-500' },
};

function OrderCard({ order }: { order: Order }) {
    const { value, icon, color } = statusMap[order.status] || statusMap.Placed;
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle className="font-headline text-xl">Order #{order.id.slice(0, 8)}...</CardTitle>
                    <CardDescription>
                        {order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : 'Date not available'}
                    </CardDescription>
                </div>
                <Badge variant={order.status === 'Cancelled' ? 'destructive' : 'default'}>{order.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Items</h4>
                    <div className="space-y-2">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <p className="text-muted-foreground">{item.name} <span className="font-mono">x{item.quantity}</span></p>
                                <p>{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>{formatCurrency(order.subtotal)}</p>
                </div>

                {order.status !== 'Cancelled' && (
                    <div className="pt-2">
                        <h4 className="font-semibold mb-2">Order Status</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">{icon}</div>
                            <Progress value={value} indicatorClassName={color} />
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full">Track Order</Button>
            </CardFooter>
        </Card>
    )
}


export default function OrdersPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'orders'),
            orderBy('orderDate', 'desc')
        );
    }, [user, firestore]);

    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

    const isLoadingPage = isUserLoading || isLoading;

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">My Orders</h1>
                <p className="text-muted-foreground mt-2">View your order history and track your shipments.</p>
            </div>
            
            {isLoadingPage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                         <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : orders && orders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
                    <CardHeader>
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                        <CardTitle className="mt-4">You have no orders yet</CardTitle>
                        <CardDescription>When you place an order, it will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/shop">Start Shopping</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
