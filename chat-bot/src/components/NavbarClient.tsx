"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "./theme-selector";
import { UserCircle } from "lucide-react"; 

export function NavbarClient() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/v1/validate", { method: "GET", credentials: "include" });
        if (!isMounted) return;
        setLoggedIn(res.ok);
      } catch {
        if (!isMounted) return;
        setLoggedIn(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <nav className="flex justify-between items-center p-4 w-full bg-dark">
      <div className="text-2xl font-bold">ChatBot</div>

      <div className="flex items-center">
        <ThemeSelector />

        {loggedIn ? (
          <Link href="/profile">
            <Button variant="ghost" className="p-2 ml-3">
              <UserCircle className="w-5 h-5" />
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="p-2 ml-3">
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
