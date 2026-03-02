'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, X } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useGetAuthenticatedClient,
  useUpdateClientProfile,
} from '@/hooks/use-auth-queries';
import { Spinner } from '@/components/ui/spiner';
import { CodeBlock } from '@/components/ui/code-block';

const clientSchema = z.object({
  appId: z.string().nonempty({ message: 'App ID is required' }),
  redirectUris: z.array(
    z.string().url({ message: 'Please enter a valid URL' }),
  ),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function ClientDashboardPage() {
  const { data: clientData, isLoading: isLoadingProfile } =
    useGetAuthenticatedClient();
  const updateProfile = useUpdateClientProfile();

  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const copyTimeoutRef = useRef<NodeJS.Timeout>(null);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      appId: clientData?.appId || '',
      redirectUris: clientData?.redirectUris || [''],
    },
  });

  // Pull out field‐array helpers:
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error - TS expects name to be of type never for unknown reason
    name: 'redirectUris',
  });

  // Update form when client data is loaded
  useEffect(() => {
    if (clientData) {
      form.reset({
        appId: clientData.appId,
        redirectUris: clientData.redirectUris.length
          ? clientData.redirectUris
          : [''],
      });
    }
  }, [clientData, form]);

  async function onSubmit(values: z.infer<typeof clientSchema>) {
    if (!clientData?.id) {
      return;
    }

    await updateProfile
      .mutateAsync({
        clientId: clientData.id.toString(),
        data: {
          updatedAppId: values.appId,
          updatedRedirectUris: values.redirectUris,
        },
      })
      .catch(() => {
        form.reset();
      });
  }

  if (isLoadingProfile) {
    return (
      <>
        <div className="py-8">
          <h1 className="text-2xl font-medium mb-6">Client Dashboard</h1>
          <div className="flex flex-col items-center justify-center h-64">
            <Spinner className="text-gray-500" />
            <p className="text-gray-500">Loading client data</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="py-8 px-5">
        <h1 className="text-2xl font-medium mb-6">Client Dashboard</h1>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 bg-gray-50 text-gray-600">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="integration"
              className="data-[state=active]:bg-white"
            >
              Integration Guide
            </TabsTrigger>
            {/* <TabsTrigger value="users" className="data-[state=active]:bg-white">
              Users
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="max-w-3xl mx-auto space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* App Identity section */}
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      App Identity
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      The identifier your users authenticate against.
                    </p>
                    <FormField
                      control={form.control}
                      name="appId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 text-xs font-medium">
                            App ID
                          </FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="Enter your App ID"
                                {...field}
                                className="border-gray-200 focus:border-gray-300 focus:ring-gray-200 font-mono text-sm"
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => handleCopy(field.value)}
                              className="px-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              {copied ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Redirect URIs section */}
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      Redirect URIs
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      MTAS will only redirect users to these URLs after login.
                      Must be exact matches.
                    </p>
                    <FormField
                      control={form.control}
                      name="redirectUris"
                      render={() => (
                        <FormItem>
                          <div className="space-y-2">
                            {fields.map((field, index) => (
                              <FormField
                                key={field.id}
                                control={form.control}
                                name={`redirectUris.${index}` as const}
                                render={({ field }) => (
                                  <FormItem className="flex items-start gap-2">
                                    <div className="flex-1">
                                      <FormControl>
                                        <Input
                                          placeholder="https://your-app.com/callback"
                                          {...field}
                                          className="border-gray-200 font-mono text-sm"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => remove(index)}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </FormItem>
                                )}
                              />
                            ))}

                            <button
                              type="button"
                              onClick={() => append('')}
                              className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                            >
                              + Add redirect URI
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      className="border-gray-200 text-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>

          <TabsContent value="integration" className="mt-0">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900">
                  Integration Guide
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Get your app connected to MTAS in four steps.
                </p>
              </div>

              {/* Steps 1 & 2 — side by side */}
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                {/* Step 1 */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-sm font-semibold">
                      1
                    </span>
                    <h4 className="font-medium text-gray-900">
                      Redirect users to login
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Send users to the MTAS login page with your app ID and
                    callback URL.
                  </p>
                  <div className="bg-stone-50 rounded-lg border border-stone-200 px-4 py-3">
                    <p className="text-[10px] text-stone-400 mb-1 font-medium uppercase tracking-wider">
                      Login URL
                    </p>
                    <code className="text-xs text-gray-700 font-mono break-all leading-relaxed">
                      {`${window.location.origin}/user/login?appId=${clientData?.appId || '<your-app-id>'}&redirectUri=`}
                      <span className="text-amber-600">
                        {'<your-callback-url>'}
                      </span>
                    </code>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Redirect URI must be in your{' '}
                    <span className="text-gray-600 font-medium">
                      Trusted Redirect URIs
                    </span>
                    .
                  </p>
                </div>

                {/* Step 2 */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-sm font-semibold">
                      2
                    </span>
                    <h4 className="font-medium text-gray-900">
                      Handle the callback
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    MTAS redirects back to your app with a one-time auth code in
                    the URL.
                  </p>
                  <div className="bg-stone-50 rounded-lg border border-stone-200 px-4 py-3">
                    <p className="text-[10px] text-stone-400 mb-1 font-medium uppercase tracking-wider">
                      Your callback receives
                    </p>
                    <code className="text-xs text-gray-700 font-mono break-all leading-relaxed">
                      {'https://your-app.com/callback?'}
                      <span className="text-amber-600">
                        auth_code=a1b2c3d4...
                      </span>
                    </code>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Extract{' '}
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] font-mono text-gray-600">
                      auth_code
                    </code>{' '}
                    from query params. Single-use, 5 min expiry.
                  </p>
                </div>
              </div>

              {/* Steps 3 & 4 — full width with code */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Step 3 */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-sm font-semibold">
                      3
                    </span>
                    <h4 className="font-medium text-gray-900">
                      Exchange code for JWT
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    From your frontend, exchange the auth code for an access
                    token.
                  </p>
                  <CodeBlock
                    code={`const res = await fetch(
  '${process.env.NEXT_PUBLIC_API_URL || 'https://<mtas-api>'}/user-auth/exchange-token',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authCode: authCodeFromCallback,
      appId: '${clientData?.appId || '<your-app-id>'}',
      redirectUri: '<same URI from step 1>',
    }),
  }
);

const { access_token } = await res.json();`}
                  />
                </div>

                {/* Step 4 */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-sm font-semibold">
                      4
                    </span>
                    <h4 className="font-medium text-gray-900">
                      Verify JWT in your backend
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Fetch the MTAS public key once, then verify tokens locally.
                  </p>
                  <CodeBlock
                    code={`const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

const client = jwksClient({
  jwksUri: '${process.env.NEXT_PUBLIC_API_URL || 'https://<mtas-api>'}/.well-known/jwks.json',
  cache: true,
});

async function verifyToken(token) {
  const decoded = jwt.decode(token, { complete: true });
  const key = await client.getSigningKey(decoded.header.kid);
  return jwt.verify(token, key.getPublicKey(), {
    algorithms: ['RS256'],
  });
  // { id: 42, type: 'user', iat: ..., exp: ... }
}`}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* <TabsContent value="users" className="mt-0">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-medium">Registered Users</CardTitle>
                <CardDescription>Users who have authenticated with your application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientData?.users?.length > 0 ? (
                        clientData.users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-mono text-gray-600">{user.id}</td>
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500">
                            No users have authenticated with your application yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </>
  );
}
