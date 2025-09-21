"use client";

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
import { useState, useEffect } from "react";
import { User, Mail } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  fullName: string;
  profileImage?: string | null;
}

export default function Profile() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data...");
        const res = await fetch("/api/v1/validate", { 
          method: "GET", 
          credentials: "include" 
        });
        
        
        if (res.ok) {
          const data = await res.json();
          console.log("User data received:", data);
          setUserData(data.data.user);
        } else {
          console.error("Failed to fetch user data, status:", res.status);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchUserData();
    }
  }, [open]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Information</DialogTitle>
          <DialogDescription>
            Your account details and profile information
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* Profile Image and Name */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={userData.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                    {getInitials(userData.fullName)}
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{userData.fullName}</h3>
                <p className="text-sm text-muted-foreground">
                  {userData.profileImage ? "Google Account" : "Local Account"}
                </p>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{userData.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load profile data</p>
            <p className="text-xs text-muted-foreground mt-2">
              Check console for details
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
