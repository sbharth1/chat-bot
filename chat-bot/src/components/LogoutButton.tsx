"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/v1/validate", { method: "GET", credentials: "include" });
        if (!isMounted) return;
        setLoggedIn(res.ok);
      } catch {
        if (!isMounted) return;
        setLoggedIn(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      };
    };
    checkAuth();    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: false 
      });

      await axios.post("/api/v1/logout");
      
      setOpen(false);
      setLoggedIn(false);
      
      window.location.href = "/";
    } catch (error) {
      console.error("An error occurred during logout:", error);
      window.location.href = "/";
    }
  };

  if (isLoading) {
    return null;
  }

  if (!loggedIn) {
    return (
      <Link href="/login">
        <Button variant="outline" className="w-full">
          Login
        </Button>
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Log Out
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogDescription>
            Are you sure you want to logout? You will be redirected to the home page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleLogout}>
            Yes, Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
