"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  fullName: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/v1/validate", { 
          method: "GET", 
          credentials: "include" 
        });
        
        if (!isMounted) return;
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch {
        if (!isMounted) return;
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const redirectIfLoggedIn = () => {
    if (isLoggedIn && !isLoading) {
      router.push("/");
    }
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    redirectIfLoggedIn
  };
}