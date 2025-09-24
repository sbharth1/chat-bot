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
import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";

export default function LogoutButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { isLoggedIn, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: false 
      });

      await axios.post("/api/v1/logout");
      setOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("An error occurred during logout:", error);
      window.location.href = "/";
    }
  };

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
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
