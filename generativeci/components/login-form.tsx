'use client'

import React, { useState } from "react";
import { auth } from "@/app/firebase/config"; // Assuming Firebase is initialized here
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth function
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
import { useRouter } from 'next/navigation'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState(""); // State for error message
  const [loading, setLoading] = useState(false); // State for loading status
  const router = useRouter(); // Get router instance for redirection

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    setLoading(true); // Set loading to true during login process
    setError(""); // Reset error message on new attempt

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Firebase login function

      setEmail(""); // Clear email input after successful login
      setPassword(""); // Clear password input after successful login

      // Redirect to dashboard after successful login
      router.push(`/userdashboard/${userCredential.user.uid}`); // Or  if user-specific
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Invalid email or password."); // Show error message
    } finally {
      setLoading(false); // Set loading to false once login process is finished
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
                  value={email} // Bind email input value
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
                  value={password} // Bind password input value
                  onChange={(e) => setPassword(e.target.value)} // Update password state
                  required
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"} {/* Show loading text when logging in */}
              </Button>

              {/* Success Message */}
              {!error && <p className="text-green-500 text-center mt-4">Login successful!</p>}

              {/* Error Message */}
              {error && <p className="text-red-500 text-center mt-4">{error}</p>} {/* Show error message if any */}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
