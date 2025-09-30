"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "../utils/api";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const strongPasswordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!strongPasswordRegex.test(password)) {
      newErrors.password ="Password is invaild";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // Clear any stale user to avoid cross-session bleed
        localStorage.removeItem("user");
      }
      toast.success(data.message || "Login successful!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <Image src="/cs logo.svg" alt="CS Logo" width={56} height={56} priority />
          </div>
          <CardTitle className="text-center text-xl font-semibold">
            Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);

                  if (value === "") {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Email is required",
                    }));
                  } else if (!/\S+@\S+\.\S+/.test(value)) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Email is invalid",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  if (value === "") {
                    setErrors((prev) => ({
                      ...prev,
                      password: "Password is required",
                    }));
                  } else if (!strongPasswordRegex.test(value)) {
                    setErrors((prev) => ({
                      ...prev,
                      password:
                        "Password is invaild",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              {password.length > 0 &&(
                 <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              )}
             
              {errors.password && (
                <p className="text-sm text-red-500">Password is invaild</p>
              )}
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
