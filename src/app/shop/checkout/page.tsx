
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useCartStore, { type CartItem } from '@/lib/cart-store';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building, Home, Loader2, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function OrderSummary() {
    const { items, subtotal } = useCartStore();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map(item => {
                    const image = PlaceHolderImages.find(p => p.id === item.imageId);
                    return (
                        <div key={item.id} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary">
                                {image && <Image src={image.imageUrl} alt={item.name} fill style={{objectFit: 'cover'}} />}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    )
                })}
                <Separator />
                <div className="flex justify-between font-bold">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}

function ShippingAddressStep({ onNext }: { onNext: () => void }) {
    // This would fetch saved addresses for a logged-in user
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input id="address" placeholder="123 Pet Lane" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="Animal City" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input id="zip" placeholder="12345" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Button onClick={onNext} className="w-full">Continue to Payment</Button>
        </div>
    )
}

function PaymentStep({ onPlaceOrder, isPlacingOrder }: { onPlaceOrder: (paymentMethod: string) => void, isPlacingOrder: boolean }) {
    const [paymentMethod, setPaymentMethod] = useState('upi');

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="flex items-center space-x-2 rounded-md border p-4">
                            <RadioGroupItem value="upi" id="upi" />
                            <Label htmlFor="upi" className="flex items-center gap-2 font-medium cursor-pointer">
                                <Landmark /> UPI / QR Code
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border p-4">
                            <RadioGroupItem value="wallet" id="wallet" />
                            <Label htmlFor="wallet" className="flex items-center gap-2 font-medium cursor-pointer">
                                <Home /> Wallet
                            </Label>
                        </div>
                         <div className="flex items-center space-x-2 rounded-md border p-4">
                            <RadioGroupItem value="card" id="card" disabled />
                            <Label htmlFor="card" className="flex items-center gap-2 font-medium cursor-not-allowed text-muted-foreground">
                                Credit / Debit Card (coming soon)
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
            <Button onClick={() => onPlaceOrder(paymentMethod)} className="w-full" disabled={isPlacingOrder}>
                {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </Button>
        </div>
    )
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { items, subtotal, clearCart } = useCartStore();
    const [step, setStep] = useState('address');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (items.length === 0 && !isPlacingOrder) {
            router.replace('/shop');
        }
    }, [items, isPlacingOrder, router]);
    
    const handlePlaceOrder = async (paymentMethod: string) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'You must be logged in to place an order.' });
            router.push('/login?redirect=/shop/checkout');
            return;
        }

        setIsPlacingOrder(true);
        try {
            const ordersCollection = collection(firestore, 'orders');
            await addDoc(ordersCollection, {
                userId: user.uid,
                items: items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
                subtotal: subtotal,
                paymentMethod: paymentMethod,
                status: 'Placed',
                orderDate: serverTimestamp(),
            });

            clearCart();
            router.push('/shop/checkout/success');
        } catch (error) {
            console.error("Error placing order:", error);
            toast({ variant: 'destructive', title: 'Order Failed', description: 'There was an error placing your order. Please try again.' });
            setIsPlacingOrder(false);
        }
    }
    
    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Your cart is empty. Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-center mb-8">Checkout</h1>
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="md:order-2">
                    <OrderSummary />
                </div>
                <div className="md:order-1">
                    <Tabs value={step} onValueChange={setStep} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="address" disabled={isPlacingOrder}>Shipping</TabsTrigger>
                            <TabsTrigger value="payment" disabled={isPlacingOrder}>Payment</TabsTrigger>
                        </TabsList>
                        <TabsContent value="address" className="mt-6">
                            <ShippingAddressStep onNext={() => setStep('payment')} />
                        </TabsContent>
                        <TabsContent value="payment" className="mt-6">
                            <PaymentStep onPlaceOrder={handlePlaceOrder} isPlacingOrder={isPlacingOrder} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
