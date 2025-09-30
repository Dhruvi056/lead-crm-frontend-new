"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { getMe, updateProfile } from "@/app/utils/api"
import { toast } from "react-hot-toast"

export default function EditProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe() // API to get logged-in user
        if (me?.user) {
          const u = me.user
          setFormData({
            id: u._id,
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            phoneNumber: (u.phoneNumber ?? "").toString(),
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          })
        }
      } catch (err) {
        toast.error("Failed to fetch user info")
      }
    })()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordSection = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.currentPassword) newErrors.currentPassword = "Current password is required"
    if (!formData.newPassword) newErrors.newPassword = "New password is required"
    else if (formData.newPassword.length < 6) newErrors.newPassword = "New password must be at least 6 characters"
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }


  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePersonalInfo()) return
    setIsLoading(true)
    try {
      await updateProfile(formData.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      })
      toast.success("Personal information updated")
      router.push("/dashboard/leads")
    } catch (err: any) {
      toast.error(err?.message || "Failed to update personal information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswordSection()) return
    setIsLoading(true)
    try {
      await updateProfile(formData.id, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
      toast.success("Password updated")
      setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
      router.push("/dashboard/leads")
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 flex items-center space-x-4">
        <Link href="/dashboard/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information and account settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSavePersonalInfo} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Personal Info"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                className={errors.currentPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  className={errors.newPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleChangePassword} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href="/dashboard/leads">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
    </div>
  )
}
