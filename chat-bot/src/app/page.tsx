"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavbarClient } from "@/components/NavbarClient";

export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen w-full font-sans">
        <NavbarClient isAuthenticated/>
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
