"use client";

import { ThemeSelector } from "./theme-selector";
import LogoutButton from "./LogoutButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";

export function NavbarClient() {
  const [selectedModel, setSelectedModel] = useState("flash");

  return (
    <nav className="flex justify-between items-center p-4 w-full bg-dark text-white">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold">ChatBot</div>

        <div className="w-[200px]">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="flash"
                className="px-2 py-1 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] transition rounded-md data-[state=checked]:bg-[#4A4A4A] data-[state=checked]:font-semibold ml-3"
              >
                Gemini 2.5 Flash
              </SelectItem>
              <SelectItem
                value="pro"
                className="px-2 py-1 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] transition rounded-md data-[state=checked]:bg-[#4A4A4A] data-[state=checked]:font-semibold ml-3"
              >
                Gemini 2.5 Pro{" "}
                <LockKeyhole className="ml-3" size={16} />
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeSelector />
        <LogoutButton />
      </div>
    </nav>
  );
}
