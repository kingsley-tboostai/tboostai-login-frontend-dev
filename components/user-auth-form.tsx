'use client';

import * as React from 'react';
import { Loader2, Chrome } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/axios';
// interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState('');
  const { toast } = useToast();
  const router = useRouter();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    console.log('=== Email Login Process Started ===');
    console.log('Email:', email);

    try {
      console.log('Requesting verification code...');
      await authApi.post(
        '/auth/email/request-code',
        {
          email: email,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Verification code request successful');

      console.log('Redirecting to verification page...');
      router.push(`/login/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Request error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Requesting Google auth URL...');

      // 使用 authApi 实例
      const { data } = await authApi.get('/auth/google/url');
      console.log('Google auth URL received:', data);

      if (data.url) {
        console.log('Redirecting to Google auth...');
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Full error:', error);
      toast({
        title: 'Error signing in with Google',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button
            disabled={isLoading}
            className="w-full text-white"
            style={{ backgroundColor: '#2D5181' }}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue with Email
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={handleGoogleSignIn}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Chrome className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
    </div>
  );
}
