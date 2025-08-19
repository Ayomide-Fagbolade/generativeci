'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { SignOutButton } from './signout';

type NavbarProps = {
  links: { label: string; href: string }[];
};

export function Navbar({ links }: NavbarProps) {
  const [user] = useAuthState(auth);

  return (
    <header className="bg-white border-b shadow-sm w-full">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-full">
          <img src="/um6pSci.png" alt="UM6P Logo" className="  h-16 w-auto" />
          </div>
      
        </Link>

        <nav className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-700">{user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <Link href="/user">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}