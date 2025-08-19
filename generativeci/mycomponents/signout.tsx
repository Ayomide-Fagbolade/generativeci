'use client';

import React from 'react';
import { Button } from '@/components/ui/button'; // Import ShadCN Button
import { signOut } from 'firebase/auth'; // Firebase signOut method
import { auth } from '@/app/firebase/config'; // Firebase auth instance
import { useRouter } from 'next/navigation'; // For navigation

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Firebase sign out
      console.log('User signed out successfully.');
      router.push('/'); // Redirect to login page after signing out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      className="w-full py-2 px-4 text-black font-semibold rounded-lg shadow-md transition-all transform hover:scale-105 hover:shadow-lg "
    >
      Sign Out
    </Button>
  );
}
