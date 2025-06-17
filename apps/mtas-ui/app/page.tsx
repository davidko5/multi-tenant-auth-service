import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="h-screen overflow-y-scroll scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <section id="form" className="flex min-h-screen">
        {/* Left side with image */}
        <div className="hidden md:flex md:w-1/2 bg-gray-100 items-center justify-center p-6">
          <div className="max-w-md">
            <Image
              src="/auther-root-img.png"
              alt="Authentication"
              width={400}
              height={400}
              className="mx-auto"
            />
            <h2 className="text-2xl font-medium text-center mt-6">
              Secure Authentication
            </h2>
            <p className="text-gray-600 text-center mt-2">
              Connect your applications with our authentication service
            </p>
          </div>
        </div>

        {/* Right side with options */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-medium">Welcome</h1>
              <p className="text-gray-500 mt-2">
                Choose your account type to continue
              </p>
            </div>

            <div className="space-y-4">
              <Button
                asChild
                className="w-full h-12 text-base bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
              >
                <Link href="/client/login">Continue as Client</Link>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">or</span>
                </div>
              </div>

              <Button
                asChild
                className="w-full h-12 text-base bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
              >
                <Link href="#about">
                  <ArrowDown
                    className="h-6 w-6 [animation:shake-freeze_2.2s_linear_infinite] [animation-delay:1s]"
                  />
                  About the platform
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* About the platform */}
      <section id="about" className="flex min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                About Multi Tenant Auth Service (MTAS)
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                A lightweight authentication broker that lets independent web
                apps outsource sign-in functionality, so you can focus on what
                matters most — your domain features.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-16">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  How It Works
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <p className="text-gray-700">
                      User hits a protected route in your app
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <p className="text-gray-700">
                      Your app redirects to MTAS with client ID and redirect URI
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <p className="text-gray-700">
                      MTAS presents a unified login/registration interface
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      4
                    </div>
                    <p className="text-gray-700">
                      Upon success, user gets redirected back with an auth code
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      5
                    </div>
                    <p className="text-gray-700">
                      Your app exchanges the code for a JWT token
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      6
                    </div>
                    <p className="text-gray-700">
                      Validate JWTs locally with our public key—no extra network
                      calls!
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Key Benefits
                </h3>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      🔒 Secure by Design
                    </h4>
                    <p className="text-gray-600 text-sm">
                      RS256 JWT tokens, one-time codes, and bcrypt password
                      hashing ensure your users' data stays protected.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      🚀 Stay Stateless
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Your apps remain completely stateless—MTAS handles all
                      session management and cookie setting.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      🎯 Focus on Features
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Stop building auth flows and start building what makes
                      your app unique.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      🏢 Client Isolation
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Each client app has its own user silo—users can't
                      accidentally access other applications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Built with Modern Tech
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Backend</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• NestJS v10 + class-validator</li>
                    <li>• JWT (RS256) authentication</li>
                    <li>• PostgreSQL + Prisma ORM</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Frontend</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Next.js 14 + React 18</li>
                    <li>• shadcn/ui components</li>
                    <li>• Zod validation</li>
                    <li>• React Hook Form</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    DevOps & Quality
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Docker Compose</li>
                    <li>• GitHub Actions CI/CD</li>
                    <li>• Jest + Playwright testing</li>
                    <li>• ESLint + Prettier</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                MTAS is evolving with new features like enhanced user
                dashboards, multi-tenant isolation, and email workflows. Join us
                in building the future of authentication!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href="/client/register">Register Your App</Link>
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Questions or feedback? We'd love to hear from you!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
