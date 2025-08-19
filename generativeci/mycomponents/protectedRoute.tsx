// components/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/config";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: string; // Role required to access the page (e.g., "admin")
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is authenticated, check role
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.role === requiredRole) {
            setAuthorized(true);
          } else {
            console.error("Unauthorized access: insufficient role.");
            router.push("/"); // Redirect unauthorized users
          }
        } else {
          console.error("User document not found.");
          router.push("/"); // Redirect if user document doesn't exist
        }
      } else {
        console.error("User not authenticated.");
        router.push("/user"); // Redirect unauthenticated users
      }

      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [router, requiredRole]);

  if (loading) {
    return <p>Loading...</p>; // Show a loading state while verifying user
  }

  if (!authorized) {
    return null; // Prevent rendering content if user is not authorized
  }

  return <>{children}</>; // Render protected content
}
