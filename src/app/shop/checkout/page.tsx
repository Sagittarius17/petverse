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
import { Building, Home, Loader2, Landmark, DollarSign, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/localization';

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
                            <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                    )
                })}
                <Separator />
                <div className="flex justify-between font-bold">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
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
    const [selectedUpi, setSelectedUpi] = useState('gpay');
    const [selectedWallet, setSelectedWallet] = useState('petverse');

    const buttonText = paymentMethod === 'cod' ? 'Place Order' : 'Pay & Place Order';

    const handlePlaceOrderClick = () => {
        let finalPaymentMethod = paymentMethod;
        if (paymentMethod === 'upi') {
            finalPaymentMethod = `UPI: ${selectedUpi.charAt(0).toUpperCase() + selectedUpi.slice(1)}`;
        } else if (paymentMethod === 'wallet') {
            finalPaymentMethod = `Wallet: ${selectedWallet === 'petverse' ? 'PetVerse Wallet' : 'Amazon Pay'}`;
        }
        onPlaceOrder(finalPaymentMethod);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                        {/* UPI */}
                        <div className="rounded-md border p-4 has-[[data-state=checked]]:border-primary transition-colors">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="upi" id="upi" />
                                <Label htmlFor="upi" className="flex flex-1 items-center gap-2 font-medium cursor-pointer">
                                    <Landmark /> UPI / QR Code
                                </Label>
                            </div>
                            {paymentMethod === 'upi' && (
                                <div className="pl-6 pt-4">
                                    <p className="text-sm font-medium mb-2">Select UPI App</p>
                                    <RadioGroup value={selectedUpi} onValueChange={setSelectedUpi} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {['gpay', 'phonepe', 'paytm'].map((app) => (
                                            <div key={app}>
                                                <RadioGroupItem value={app} id={app} className="peer sr-only" />
                                                <Label htmlFor={app} className="flex h-12 items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer capitalize">
                                                    {app === 'gpay' ? 'GPay' : app === 'phonepe' ? 'PhonePe' : 'Paytm'}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}
                        </div>

                        {/* Wallet */}
                        <div className="rounded-md border p-4 has-[[data-state=checked]]:border-primary transition-colors">
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="wallet" id="wallet" />
                                <Label htmlFor="wallet" className="flex flex-1 items-center gap-2 font-medium cursor-pointer">
                                    <Wallet /> Wallet
                                </Label>
                            </div>
                            {paymentMethod === 'wallet' && (
                                <div className="pl-6 pt-4">
                                    <p className="text-sm font-medium mb-2">Select Wallet</p>
                                    <RadioGroup value={selectedWallet} onValueChange={setSelectedWallet} className="grid grid-cols-2 gap-2">
                                        {[{id: 'petverse', name: 'PetVerse Wallet'}, {id: 'amazon', name: 'Amazon Pay'}].map((wallet) => (
                                            <div key={wallet.id}>
                                                <RadioGroupItem value={wallet.id} id={wallet.id} className="peer sr-only" />
                                                <Label htmlFor={wallet.id} className="flex h-12 items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer capitalize">
                                                    {wallet.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-2 rounded-md border p-4 opacity-50">
                            <RadioGroupItem value="card" id="card" disabled />
                            <Label htmlFor="card" className="flex items-center gap-2 font-medium cursor-not-allowed">
                                Credit / Debit Card (coming soon)
                            </Label>
                        </div>
                        
                        <div className="rounded-md border p-4 has-[[data-state=checked]]:border-primary transition-colors">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cod" id="cod" />
                                <Label htmlFor="cod" className="flex flex-1 items-center gap-2 font-medium cursor-pointer">
                                    <DollarSign /> Cash on Delivery
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
            <Button onClick={handlePlaceOrderClick} className="w-full" disabled={isPlacingOrder}>
                {isPlacingOrder ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Placing Order...</> : buttonText}
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
