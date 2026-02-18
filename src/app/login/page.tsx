
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, initiateEmailSignIn, useFirestore, initiateGoogleSignIn } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { Separator } from '@/components/ui/separator';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type FormValues = z.infer<typeof formSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
	c-5.222,0-9.657-3.657-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);


export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const checkUserStatus = async (user: User) => {
    if (!firestore) return false;
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().status === 'Inactive') {
            return false;
        }
    } catch (e) {
        console.error("Error checking user status:", e);
        // Fail open in case of firestore read error, auth will handle it.
    }
    return true;
  };

  const onEmailSubmit = async (data: FormValues) => {
    try {
      const userCredential = await initiateEmailSignIn(auth, data.email, data.password);
      const isActive = await checkUserStatus(userCredential.user);

      if (!isActive) {
        await auth.signOut();
        toast({
          variant: 'destructive',
          title: 'Account Suspended',
          description: "This account is inactive or has been suspended. Please contact support or create a new account.",
          duration: 9000,
        });
        return;
      }
      
      toast({
        title: 'Login Successful',
        description: "Welcome back!",
      });
      router.push('/profile');
    } catch (error) {
      handleAuthError(error);
    }
  };

  const onGoogleSubmit = async () => {
    try {
      const userCredential = await initiateGoogleSignIn(auth, firestore);
      const isActive = await checkUserStatus(userCredential.user);
      
      if (!isActive) {
        await auth.signOut();
        toast({
          variant: 'destructive',
          title: 'Account Suspended',
          description: "This account is inactive or has been suspended. Please contact support or create a new account.",
          duration: 9000,
        });
        return;
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/profile');
    } catch (error) {
      handleAuthError(error);
    }
  };
  
  const handleAuthError = (error: any) => {
      console.error("Authentication Error: ", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = "Invalid email or password. Please double-check your credentials.";
            break;
          case 'auth/too-many-requests':
            description = "Access to this account has been temporarily disabled due to many failed login attempts. You can try again later.";
            break;
          case 'auth/popup-closed-by-user':
            description = 'Sign-in process was cancelled.';
            break;
          case 'auth/account-exists-with-different-credential':
            description = "An account already exists with this email address. Please sign in with the original method you used.";
            break;
          default:
            description = `A login error occurred: ${error.message}`;
            break;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description,
      });
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background p-4">
      <Card className="w-full max-w-sm bg-secondary shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" className="w-full" onClick={onGoogleSubmit}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-secondary px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In with Email'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
