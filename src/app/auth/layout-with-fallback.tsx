"use client";

import Image from "next/image";
import { useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Auth Form */}
      <div className="flex items-center justify-center p-8 bg-gray-50/50 backdrop-blur-3xl">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Bodega App
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Manage your inventory with ease
            </p>
          </div>
          {children}
        </div>
      </div>

      {/* Right: Branding/Pattern */}
      <div className="hidden lg:flex relative overflow-hidden bg-neutral-900">
        {!imageError ? (
          <div className="relative w-full h-full">
            <Image
              src="/auth-hero.png"
              alt="Bodega App Abstract Background"
              fill
              sizes="50vw"
              className="object-cover opacity-80"
              priority
              unoptimized
              onError={() => {
                console.error("Failed to load auth-hero.png");
                setImageError(true);
              }}
            />
          </div>
        ) : (
          // Fallback gradient pattern if image fails
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-900">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,.05) 10px,
                  rgba(255,255,255,.05) 20px
                )`
              }}
            />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/50 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-end h-full p-16">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6 text-white leading-tight">
              Data-driven decisions for your business.
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Track sales, manage inventory, and optimize your bodega operations
              all in one place. Experience the future of retail management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
