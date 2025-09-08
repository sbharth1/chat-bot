"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "./theme-selector";


export function NavbarClient() {
  return (
    <nav className="flex justify-between items-center p-4 w-full">
      <div className="text-2xl font-bold">chatBot</div>
      <div className="flex items-center">
        <ThemeSelector />

   
         
            {/* <Link href="/profile">
              <Button variant="outline" className="p-2 ml-3">
                Profile
              </Button>
            </Link> */}
            {/* <LogoutButton /> */}
       
          <Link href="/login">
            <Button variant="outline" className="p-2 ml-3">
              Login
            </Button>
          </Link>
       
      </div>
    </nav>
  );
}
