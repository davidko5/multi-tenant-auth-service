'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/header';
import { useUserLogin } from '@/hooks/use-auth-queries';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export default function UserLoginPage() {
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirectUri');
  const appId = searchParams.get('appId');
  
  const userLogin = useUserLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await userLogin.mutateAsync({
        email: values.email,
        password: values.password,
        appId: appId || '',
        redirectUri: redirectUri || '',
      }).then(() => {
        if (redirectUri && appId) {
          router.push(redirectUri);
        } else {
          router.push('/user/dashboard');
        }
      });
      // The redirect will be handled in the auth provider
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Left side with image */}
        <div className="hidden md:flex md:w-1/2 bg-gray-100 items-center justify-center p-6">
          <div className="max-w-md">
            <Image
              src="/login-image.png?height=400&width=400"
              alt="User Login"
              width={400}
              height={400}
              className="mx-auto"
            />
            <h2 className="text-2xl font-medium text-center mt-6">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-center mt-2">
              {redirectUri && appId
                ? 'Sign in to continue to the application'
                : 'Sign in to access your account'}
            </p>
          </div>
        </div>

        {/* Right side with form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h1 className="text-2xl font-medium">User Login</h1>
              <p className="text-gray-500 mt-2">
                {redirectUri && appId
                  ? 'Login to continue to the application'
                  : 'Enter your credentials to login'}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="border-gray-200 focus:border-gray-300 focus:ring-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          className="border-gray-200 focus:border-gray-300 focus:ring-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={userLogin.isPending}
                >
                  {userLogin.isPending ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </Form>

            <div className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{' '}
              <Link
                href={
                    redirectUri && appId
                      ? `/user/register?redirectUri=${encodeURIComponent(redirectUri)}&appId=${appId}`
                    : '/user/register'
                }
                className="text-gray-800 hover:underline"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
