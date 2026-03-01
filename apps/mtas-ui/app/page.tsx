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
      <section id="about" className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                About MTAS
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                A multi-tenant authentication broker. Register your app,
                redirect users here for login, get back an RS256-signed JWT —
                your backend verifies it locally using the public key.
              </p>
            </div>

            {/* Architecture diagram */}
            <div className="mb-16">
              <div className="bg-white rounded-xl">
                <Image
                  src="/mtas-diagram.jpg"
                  alt="MTAS system architecture diagram showing communication between Client App, MTAS UI, MTAS API, and Client Backend"
                  width={1200}
                  height={675}
                  className="w-full h-auto rounded"
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-3">
                Your frontend redirects to MTAS for login, exchanges an auth
                code for a JWT, and your backend verifies it using the MTAS
                public key.
              </p>
            </div>

            {/* How it works */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                How It Works
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { emoji: '🔗', text: 'Your app redirects the user to MTAS with your appId and redirect URI' },
                  { emoji: '🔐', text: 'User authenticates on the MTAS login page' },
                  { emoji: '🎟️', text: 'MTAS redirects back with a one-time auth code (5 min TTL)' },
                  { emoji: '🔄', text: 'Your frontend exchanges the code for an RS256-signed JWT' },
                  { emoji: '🔑', text: 'Your backend fetches the MTAS public key once and caches it' },
                  { emoji: '✅', text: 'All subsequent requests are verified locally — no calls to MTAS' },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{step.emoji}</span>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        Step {i + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key properties */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Key Properties
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    🏢 Tenant Isolation
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Each client app gets its own user pool. Users belong strictly
                    to the client that registered them and are never shared. The
                    same email can exist under different clients.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    ⚡ Stateless Verification
                  </h4>
                  <p className="text-gray-600 text-sm">
                    JWTs are signed with RS256 (asymmetric). Your backend fetches
                    the public key from a standard JWKS endpoint once, then
                    verifies every token locally.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    🎟️ Auth Code Exchange
                  </h4>
                  <p className="text-gray-600 text-sm">
                    OAuth2-inspired flow: login returns a short-lived auth code
                    (single use, 5 min TTL) that gets exchanged for a JWT. Tokens
                    never pass through browser redirects.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-xl border border-purple-100">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    🛡️ Redirect URI Whitelist
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Login attempts are rejected unless the redirect URI is
                    registered in the client&apos;s whitelist. Prevents open
                    redirect attacks.
                  </p>
                </div>
              </div>
            </div>

            {/* Tech stack */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-16">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Tech Stack
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚙️</span> API
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li>NestJS 11 + TypeORM</li>
                    <li>JWT (RS256 / HS256)</li>
                    <li>PostgreSQL</li>
                    <li>Passport.js</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🖥️</span> UI
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li>Next.js 15 + React 19</li>
                    <li>shadcn/ui + Tailwind CSS</li>
                    <li>React Hook Form + Zod</li>
                    <li>TanStack Query</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🚀</span> Infrastructure
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li>Docker Compose (PostgreSQL)</li>
                    <li>Vercel (UI)</li>
                    <li>Render (API)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Try It Out
              </h3>
              <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                Register a client account, configure your redirect URIs, and
                integrate MTAS into your app.
              </p>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                <Link href="/client/register">Register Your App</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
