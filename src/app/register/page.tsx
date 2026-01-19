
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, initiateEmailSignUp, useFirestore, initiateGoogleSignIn } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-z0-9_.]+$/, "Only lowercase letters, numbers, '.', and '_' allowed."),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
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


export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onEmailSubmit = async (data: FormValues) => {
    try {
      // Check for username uniqueness
      if (firestore) {
        const usernameRef = doc(firestore, "usernames", data.username);
        const usernameSnap = await getDoc(usernameRef);
        if (usernameSnap.exists()) {
            toast({
                variant: "destructive",
                title: "Username Taken",
                description: "This username is already in use. Please choose another one.",
            });
            return;
        }
      }
      await initiateEmailSignUp(auth, firestore, data.email, data.password, data.fullName, data.username);
      toast({
        title: 'Account Created!',
        description: "You have been successfully registered.",
      });
      router.push('/profile');
    } catch (error) {
       handleAuthError(error);
    }
  };

  const onGoogleSubmit = async () => {
    try {
      await initiateGoogleSignIn(auth, firestore);
      toast({
        title: 'Account Created!',
        description: "You have been successfully registered.",
      });
      router.push('/profile');
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleAuthError = (error: any) => {
    let description = "An unexpected error occurred. Please try again.";
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          description = "This email is already in use. Please try another one or log in.";
          break;
        case 'auth/weak-password':
          description = "The password is too weak. Please choose a stronger password.";
          break;
        case 'auth/popup-closed-by-user':
          description = 'Sign-up process was cancelled.';
          break;
        case 'auth/account-exists-with-different-credential':
            description = "An account already exists with this email address. Please sign in with the original method you used.";
            break;
        default:
          description = error.message || `A registration error occurred.`;
          break;
      }
    } else if (error instanceof Error) {
        description = error.message;
    }
    toast({
      variant: "destructive",
      title: 'Registration Failed',
      description,
    });
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-secondary/50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Join PetVerse</CardTitle>
          <CardDescription>Create an account to start your journey with us.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
           <Button variant="outline" className="w-full" onClick={onGoogleSubmit}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="Max Robinson" {...register('fullName')} />
              {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="max_robinson" {...register('username')} />
              {errors.username && <p className="text-destructive text-sm mt-1">{errors.username.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="max@example.com" {...register('email')} />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
            </div>
             <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account with Email'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
