'use client'

import React, { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";  // Import Firebase auth
import { db } from "@/app/firebase/config";  // Import Firestore
import { doc, setDoc } from "firebase/firestore";  // Firestore functions

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupSuccessful, setSignupSuccessful] = useState(""); // Initialize the signup state
  const router = useRouter();

  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      const uid = res.user.uid;  // Get the user's UID
      const userRef = doc(db, "users", uid);  // Reference to the user's document in Firestore

      // Add the user to Firestore
      await setDoc(userRef, {
        email: email,
        createdAt: new Date(),  // Add the creation date
        role: "user",  // You can assign a default role
      });

      // Show the success message after the successful signup
      setSignupSuccessful("Signup successful!");
      // redirect ot /[uid]/[sid]/vote
     router.push(`/userdashboard/${uid}`);
      // router.push(`/userdashboard/${uid}`); // Or  if user-specific

      setEmail("");  // Reset email
      setPassword("");  // Reset password
    } catch (err) {
      console.error("Signup failed:", err);
      // Optionally, handle any specific error if necessary
      setSignupSuccessful('');  // Reset success message if error occurs
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Signup</CardTitle>
          <CardDescription>
            Enter your email below to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}  // Bind input value
                  onChange={(e) => setEmail(e.target.value)}  // Update email state
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}  // Bind password input value
                  onChange={(e) => setPassword(e.target.value)}  // Update password state
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Signup
              </Button>

              {/* Only show the success message if there is no error */}
              {!error && signupSuccessful && <p className="text-green-500">{signupSuccessful}</p>}

              {/* Show error message if there's an error */}
              {error && <p className="text-red-500">{error.message}</p>}  
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
