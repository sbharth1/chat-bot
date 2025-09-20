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

      const response = await axios.post("/api/v1/logout");
      if (response.status === 200) {
        setOpen(false);
        setLoggedIn(false);
        router.push("/");
        router.refresh();
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!loggedIn) {
    return (
      <Link href="/login">
        <Button variant="outline" className="p-2 ml-3">
          Login
        </Button>
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ms-2">
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
            No
          </Button>
          <Button onClick={handleLogout}>
            Yes, Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
