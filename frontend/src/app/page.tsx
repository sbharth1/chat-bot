"use client";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/theme-selector";
import { Input } from "@/components/ui/input";

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

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">chatBot</h1>
            <p className="text-muted-foreground">How can I help you today?</p>
          </div>
          
          <div className="w-full max-w-2xl px-4">
            <div className="flex gap-3">
              <Input 
                type="text" 
                placeholder="Ask me anything..." 
                className="flex-1"
              />
              <Button variant="outline" className="px-6">
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
