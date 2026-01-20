
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import useCartStore from '@/lib/cart-store';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Edit, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, config as localizationConfig } from '@/lib/localization';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
}

interface UserProfile extends DocumentData {
    address?: Address;
    displayName?: string;
}

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

function ShippingAddressStep({ onNext, address, setAddress }: { onNext: () => void; address: Address; setAddress: (address: Address) => void; }) {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.id]: e.target.value });
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" placeholder="John Doe" value={address.fullName} onChange={handleChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="streetAddress">Street Address</Label>
                        <Input id="streetAddress" placeholder="123 Pet Lane" value={address.streetAddress} onChange={handleChange}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="Animal City" value={address.city} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" placeholder="CA" value={address.state} onChange={handleChange}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input id="zip" placeholder="12345" value={address.zip} onChange={handleChange}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="(555) 123-4567" value={address.phone} onChange={handleChange}/>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Button onClick={onNext} className="w-full">Continue to Payment</Button>
        </div>
    )
}

function PaymentStep({ onPlaceOrder, isPlacingOrder, address, onChangeAddress, onAddNewAddress }: { onPlaceOrder: (paymentMethod: string, razorpayPaymentId?: string) => void, isPlacingOrder: boolean, address: Address, onChangeAddress: () => void, onAddNewAddress: () => void }) {
    const { subtotal } = useCartStore();
    const { user } = useUser();
    const { toast } = useToast();
    const petverseLogo = PlaceHolderImages.find(p => p.id === 'petverse-logo');

    const handlePayment = async () => {
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key || key === 'YOUR_RAZORPAY_KEY_ID') {
            toast({
                variant: 'destructive',
                title: 'Configuration Error',
                description: 'Razorpay Key ID is not configured. Please contact support.',
            });
            return;
        }
        
        const options = {
            key,
            amount: subtotal * 100 * localizationConfig.priceMultiplier,
            currency: localizationConfig.currency,
            name: "PetVerse",
            description: "Order Payment",
            image: petverseLogo?.imageUrl || "https://picsum.photos/seed/petverse-logo/128/128",
            handler: function (response: any) {
                onPlaceOrder('Razorpay', response.razorpay_payment_id);
            },
            prefill: {
                name: user?.displayName || "",
                email: user?.email || "",
                contact: address.phone || "",
            },
            theme: {
                color: "#3B82F6"
            }
        };

        if (!window.Razorpay) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Razorpay SDK could not be loaded. Please check your connection and try again."
            });
            return;
        }

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any){
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: response.error.description || 'An unknown error occurred.',
            });
        });
        rzp.open();
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <CardTitle>Shipping To</CardTitle>
                    <Button variant="outline" size="sm" onClick={onChangeAddress}>
                        <Edit className="mr-2 h-4 w-4" /> Change
                    </Button>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p className="font-semibold text-foreground">{address.fullName}</p>
                    <p>{address.streetAddress}</p>
                    <p>{address.city}, {address.state} {address.zip}</p>
                    <p>{address.phone}</p>
                </CardContent>
                <CardFooter>
                    <Button variant="secondary" className="w-full" onClick={onAddNewAddress}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add a New Address
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">You will be redirected to Razorpay to complete your purchase securely.</p>
                    <div className="rounded-md border p-4 flex items-center justify-center bg-background">
                       <svg width="120" viewBox="0 0 110 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M78.625 20.732H88.055L79.522 13.016L87.875 5.48H78.341L73.13 10.976L67.886 5.48H58.456L67.022 13.016L58.636 20.732H68.169L73.13 15.728L78.625 20.732Z" fill="#3B82F6"></path><path d="M51.936 12.215C51.936 9.215 50.436 7.028 47.103 7.028C45.836 7.028 44.753 7.379 43.853 8.015L44.553 10.229C45.286 9.879 46.153 9.665 47.07 9.665C48.336 9.665 48.97 10.532 48.97 11.665V11.848C45.036 11.498 42.453 13.032 42.453 15.682C42.453 17.615 43.786 18.982 46.036 18.982C47.603 18.982 48.87 18.348 49.67 17.515L48.653 15.532C48.053 16.032 47.186 16.348 46.32 16.348C45.32 16.348 44.886 15.848 44.886 15.115C44.886 14.132 45.886 13.682 48.136 13.615H51.936V12.215Z" fill="#526484"></path><path d="M37.885 5.48H26.385V20.732H37.885V18.132H29.352V14.048H36.985V11.448H29.352V7.996H37.885V5.48Z" fill="#526484"></path><path d="M21.921 5.48L15.354 20.732H12.354L5.788 5.48H8.988L13.838 17.449L18.721 5.48H21.921Z" fill="#526484"></path><path d="M107.5 12.9C107.5 7.9 103.5 4 98.5 4S89.5 7.9 89.5 12.9C89.5 17.9 93.5 21.8 98.5 21.8S107.5 17.9 107.5 12.9ZM92.5 12.9C92.5 9.4 95.2 6.7 98.5 6.7S104.5 9.4 104.5 12.9C104.5 16.4 101.8 19.1 98.5 19.1S92.5 16.4 92.5 12.9Z" fill="#526484"></path></svg>
                    </div>
                    <Button onClick={handlePayment} className="w-full mt-4" disabled={isPlacingOrder}>
                        {isPlacingOrder ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : 'Pay with Razorpay'}
                    </Button>
                </CardContent>
            </Card>
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
    const [isLoadingAddress, setIsLoadingAddress] = useState(true);
    const [address, setAddress] = useState<Address>({
        fullName: '',
        streetAddress: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
    });

    const userDocRef = useMemoFirebase(
        () => (user ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
        if (userProfile) {
            if (userProfile.address) {
                setAddress(userProfile.address);
                setStep('payment');
            } else {
                // If user has a profile but no address, set their name
                setAddress(prev => ({...prev, fullName: userProfile.displayName || ''}));
            }
            setIsLoadingAddress(false);
        } else if (user) {
            // User is logged in, but profile is still loading or doesn't exist yet
            setAddress(prev => ({...prev, fullName: user.displayName || ''}));
             setIsLoadingAddress(false);
        } else if (!user && !isLoadingAddress) {
            setIsLoadingAddress(false);
        }
    }, [userProfile, user, isLoadingAddress]);

    useEffect(() => {
        if (items.length === 0 && !isPlacingOrder) {
            router.replace('/shop');
        }
    }, [items, isPlacingOrder, router]);
    
    const handlePlaceOrder = async (paymentMethod: string, razorpayPaymentId?: string) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'You must be logged in to place an order.' });
            router.push('/login?redirect=/shop/checkout');
            return;
        }

        setIsPlacingOrder(true);
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            
            // 1. Save order
            const ordersCollection = collection(userDocRef, 'orders');
            const newOrderRef = await addDoc(ordersCollection, {
                userId: user.uid,
                items: items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
                subtotal: subtotal,
                paymentMethod: paymentMethod,
                razorpayPaymentId: razorpayPaymentId || null,
                status: 'Placed',
                orderDate: serverTimestamp(),
                shippingAddress: address, // Save address with order
            });

            // 2. Save address to user profile for next time
            await updateDoc(userDocRef, {
                address: address
            });

            clearCart();
            router.push(`/shop/checkout/success?orderId=${newOrderRef.id}`);
        } catch (error) {
            console.error("Error placing order:", error);
            toast({ variant: 'destructive', title: 'Order Failed', description: 'There was an error placing your order. Please try again.' });
            setIsPlacingOrder(false);
        }
    }

    const handleAddNewAddress = () => {
        setAddress({
            fullName: userProfile?.displayName || user?.displayName || '',
            streetAddress: '',
            city: '',
            state: '',
            zip: '',
            phone: '',
        });
        setStep('address');
    };
    
    const handleStepChange = (newStep: string) => {
        if (newStep === 'payment' && !address.streetAddress && userProfile?.address) {
            setAddress(userProfile.address);
        }
        setStep(newStep);
    };

    if (isLoadingAddress || (items.length === 0 && !isPlacingOrder)) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading checkout...</p>
            </div>
        );
    }

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-center mb-8">Checkout</h1>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="md:order-2">
                        <OrderSummary />
                    </div>
                    <div className="md:order-1">
                        <Tabs value={step} onValueChange={handleStepChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="address" disabled={isPlacingOrder}>Shipping</TabsTrigger>
                                <TabsTrigger value="payment" disabled={isPlacingOrder || (!address.streetAddress && !userProfile?.address)}>Payment</TabsTrigger>
                            </TabsList>
                            <TabsContent value="address" className="mt-6">
                                <ShippingAddressStep onNext={() => setStep('payment')} address={address} setAddress={setAddress} />
                            </TabsContent>
                            <TabsContent value="payment" className="mt-6">
                                <PaymentStep onPlaceOrder={handlePlaceOrder} isPlacingOrder={isPlacingOrder} address={address} onChangeAddress={() => setStep('address')} onAddNewAddress={handleAddNewAddress} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    )
}
