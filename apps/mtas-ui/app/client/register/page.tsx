'use client';

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
import { useClientRegister } from '@/hooks/use-auth-queries';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const formSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ClientRegisterPage() {
  const router = useRouter();
  const clientRegister = useClientRegister();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { confirmPassword: _confirmPassword, ...clientData } = values;
      await clientRegister.mutateAsync(clientData).then(() => {
        router.push('/client/login');
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Left side with image */}
        <div className="hidden md:flex md:w-1/2 bg-gray-100 items-center justify-center p-6">
          <div className="max-w-md">
            <Image
              src="/register.png?height=400&width=400"
              alt="Client Registration"
              width={400}
              height={400}
              className="mx-auto"
            />
            <h2 className="text-2xl font-medium text-center mt-6">
              Client Registration
            </h2>
            <p className="text-gray-600 text-center mt-2">
              Register your application to use our authentication services
            </p>
          </div>
        </div>

        {/* Right side with form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h1 className="text-2xl font-medium">Client Registration</h1>
              <p className="text-gray-500 mt-2">
                Register as a client to integrate with our authentication system
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
                          placeholder="Create a password"
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
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
                  disabled={clientRegister.isPending}
                >
                  {clientRegister.isPending ? 'Registering...' : 'Register'}
                </Button>
              </form>
            </Form>

            <div className="text-sm text-center text-gray-500">
              Already have a client account?{' '}
              <Link
                href="/client/login"
                className="text-gray-800 hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
