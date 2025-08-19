'use client'

import React, { useState } from "react";
import { auth } from "@/app/firebase/config"; // Assuming Firebase is initialized here
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth function
import { doc, getDoc } from "firebase/firestore"; // Firestore functions for checking user role
import { db } from "@/app/firebase/config"; // Your Firestore database reference
import { useRouter } from 'next/navigation';
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

export function AdminLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState(""); // State for error message
  const [loading, setLoading] = useState(false); // State for loading status
  const router = useRouter(); // Get router instance for redirection

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous error message

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Get the user document from Firestore to check the role
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        // Check if the role is 'admin'
        if (userData.role === 'admin') {
          router.push("/admindashboard"); // Redirect to the admin dashboard
        } else {
          setError("You do not have permission to access this page.");
        }
      } else {
        setError("User not found in database.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Only authorized login please
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Update email state
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Update password state
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>

              {/* Show error message */}
              {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
