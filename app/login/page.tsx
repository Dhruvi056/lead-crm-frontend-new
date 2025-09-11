"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "../utils/api";
import { toast } from "react-hot-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (!strongPasswordRegex.test(password)) {
      newErrors.password = "Password must be at least 6 characters and include uppercase, lowercase, number and symbol"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
     try {
      const data = await login({ email, password })

      if (!data.success) {
        throw{
          response:{
            status:data.status,
            data:{message:data.message || "Login Failed"}
          }
        } 
      }
      localStorage.setItem("token", data.token)
        if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }
      
      toast.success("Login successful ")
      router.push("/dashboard/leads")
    } catch (err: any) {
      if(err?.response?.status === 404){
      toast.error("404 Not Found")
      } else if (err?.response?.status === 401) {
        toast.error("Unauthorized (401)")
      }else if(err?.message){
        toast.error(err.message)
      } else{
      toast.error( "Invalid email or password")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Panel</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the dashboard</CardDescription>
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
                  const value = e.target.value
                  setEmail(value)

                  if(value === ""){
                    setErrors((prev)=>({ ...prev,email:"Email is required"}))
                  }else if(!/\S+@\S+\.\S+/.test(value)){
                    setErrors((prev) => ({ ...prev, email: "Email is invalid" }))
                  }else{
                    setErrors((prev) => ({...prev,email:""}))
                  }
                }}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>{
                  const value =e.target.value
                   setPassword(value)
                   if (value === ""){
                    setErrors((prev) => ({ ...prev, password: "Password is required" }))
                   }else if (!strongPasswordRegex.test(value)) {
                    setErrors((prev) => ({
                      ...prev,
                      password:
                        "Password must be at least 6 characters and include uppercase, lowercase, number and symbol",
                    }))
                  }else{
                      setErrors((prev) => ({ ...prev, password: "" }))
                  }
                }}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>

  )
}
