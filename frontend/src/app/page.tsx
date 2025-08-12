"use client";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/theme-selector";

export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen w-full font-sans">
        <nav className="flex justify-between items-center p-4 w-full">
          <div className="text-2xl font-bold">chatBot</div>
          <div className="flex items-center">
            <ThemeSelector />
            <Button variant="outline" className="p-2 ml-3">Login</Button>
            <Button variant="outline" className="p-2 ml-3">Sign up</Button>
          </div>
        </nav>
      </div>
    </>
  );
}
