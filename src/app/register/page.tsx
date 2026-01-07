'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, initiateEmailSignUp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { useFirestore } from '@/firebase';

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await initiateEmailSignUp(auth, firestore, data.email, data.password, data.fullName);
      toast({
        title: 'Account Created!',
        description: "You have been successfully registered.",
      });
      router.push('/profile');
    } catch (error) {
      console.error("Registration failed:", error);
       let description = "An unexpected error occurred. Please try again.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = "This email is already in use. Please try another one or log in.";
            break;
          case 'auth/weak-password':
            description = "The password is too weak. Please choose a stronger password.";
            break;
          default:
            description = "A registration error occurred. Please try again.";
            break;
        }
      }
      toast({
        variant: "destructive",
        title: 'Registration Failed',
        description,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-secondary/50 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Join PetVerse</CardTitle>
            <CardDescription>Create an account to start your journey with us.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="Max Robinson" {...register('fullName')} />
              {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
