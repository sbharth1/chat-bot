"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/auth-button";
import { ErrorResponse } from "@/lib/apiResponse";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("Login data:", formData);
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

      const res = await axios.post(`${apiUrl}/api/v1/login`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status === 200 && res.data?.success) {
        router.push("/");
      }
      setFormData({
        email: "",
        password: "",
      });
    } catch (err: unknown) {
      console.error("Login error:", err);
      
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data;
        const apiError: ErrorResponse = errorData.error || {};
        
        switch (apiError.code) {
          case "INVALID_EMAIL":
            setErrors((prev) => ({ ...prev, email: apiError.message }));
            break;
          case "INVALID_PASSWORD":
            setErrors((prev) => ({ ...prev, password: apiError.message }));
            break;
          case "VALIDATION_ERROR":
            if (apiError.message.toLowerCase().includes("email")) {
              setErrors((prev) => ({ ...prev, email: apiError.message }));
            } else if (apiError.message.toLowerCase().includes("password")) {
              setErrors((prev) => ({ ...prev, password: apiError.message }));
            } else {
              setServerError(apiError.message);
            }
            break;
          default:
            setServerError(apiError.message || "Something went wrong");
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-dark from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back
          </h1>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full ${
                    errors.email ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  placeholder="Enter your email"
                />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
             
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full ${
                    errors.password ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  placeholder="Enter your password"
                />
           
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Server Error Display */}
            {serverError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {serverError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <Separator className="my-4" />
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Or continue with
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <AuthButton />
          </div>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400">
               Don&rsquo;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
