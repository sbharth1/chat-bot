"use client";

import { NavbarClient } from "@/components/NavbarClient";
import * as React from "react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen w-full bg-dark">
      <NavbarClient isAuthenticated/>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1>hello world</h1>
        </div>
      </div>
    </div>
  );
}

