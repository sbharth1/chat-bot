"use client";

import { ThemeSelector } from "./theme-selector";
import LogoutButton from "./LogoutButton";

export function NavbarClient() {
  return (
    <nav className="flex justify-between items-center p-4 w-full bg-dark">
      <div className="text-2xl font-bold">ChatBot</div>

      <div className="flex items-center">
        <ThemeSelector />
        <LogoutButton />
      </div>
    </nav>
  );
}
