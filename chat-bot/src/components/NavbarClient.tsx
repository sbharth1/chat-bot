"use client";

import { ThemeSelector } from "./theme-selector";
import LogoutButton from "./LogoutButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export function NavbarClient() {
  return (
    <nav className="flex justify-between items-center p-4 w-full bg-dark">
      <div className="text-2xl font-bold">ChatBot</div>

      <div className="flex items-center gap-2">
        <ThemeSelector />
        <LogoutButton />
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Notice"
              className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-100 flex items-center justify-center text-sm"
            >
              ?
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Notice</DialogTitle>
              <DialogDescription>
                Notice: Email verification is not required for login or signup
                because this service is free. You can use any email if you are
                filling the form manually. However, if you are using "Continue
                with Google", please use your own Google account.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
