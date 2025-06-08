import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-screen">
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
          <h2 className="text-2xl font-medium text-center mt-6">Secure Authentication</h2>
          <p className="text-gray-600 text-center mt-2">Connect your applications with our authentication service</p>
        </div>
      </div>

      {/* Right side with options */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-medium">Welcome</h1>
            <p className="text-gray-500 mt-2">Choose your account type to continue</p>
          </div>

          <div className="space-y-4">
            <Button
              asChild
              className="w-full h-12 text-base bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
            >
              <Link href="/user/login">Continue as User</Link>
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
              <Link href="/client/login">Continue as Client</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
