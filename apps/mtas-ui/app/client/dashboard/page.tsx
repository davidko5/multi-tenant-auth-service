'use client';

import React, { useEffect, useState } from 'react';
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
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
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
    // @ts-ignore - TS expects name to be of type never for unknown reason
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

    await updateProfile.mutateAsync({
      clientId: clientData.id.toString(),
      data: {
        updatedAppId: values.appId,
        updatedRedirectUris: values.redirectUris,
      },
    }).catch((error) => {
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
            <div className="w-3xl">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-medium">
                    Profile Settings
                  </CardTitle>
                  <CardDescription>
                    Update your client profile details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="appId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              App ID
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your App ID"
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
                        name="redirectUris"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              Trusted Redirect URIs
                            </FormLabel>
                            <div className="space-y-2">
                              {fields.map((field, index) => {
                                return (
                                  <FormField
                                    key={field.id}
                                    control={form.control}
                                    name={`redirectUris.${index}` as const}
                                    render={({ field }) => (
                                      <FormItem className="flex items-start gap-2">
                                        <div className="flex-1">
                                          <FormControl>
                                            <Input
                                              placeholder="https://…"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => remove(index)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </FormItem>
                                    )}
                                  />
                                );
                              })}

                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => append('')}
                              >
                                + Add another URI
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 pt-2">
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integration" className="mt-0">
            <Card className="border-gray-200 shadow-sm w-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-medium">
                  Integration Guide
                </CardTitle>
                <CardDescription>
                  How to integrate with our authentication system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  To authenticate users with your application, redirect them to:
                </p>
                <code className="block bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto">
                  {`http://localhost:3000/user/login?redirect_uri='https://your-app.com'&app_id=${clientData?.appId}`}
                </code>

                <p className="text-sm mt-4">
                  After successful authentication, users will be redirected back
                  to your application with temporary auth code.
                </p>
              </CardContent>
            </Card>
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
