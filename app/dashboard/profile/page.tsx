"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Save, Upload } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    countryCode: "+1",
    phone: "(555) 123-4567",
    company: "Your Company",
    position: "Administrator",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Password validation (only if user is trying to change password)
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required to change password"
      }
      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required"
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "New password must be at least 6 characters"
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
      // Show success message or redirect
      router.push("/dashboard/leads")
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information and account settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-lg">
                {formData.firstName[0]}
                {formData.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
            <p className="text-xs text-gray-500 text-center">JPG, PNG or GIF. Max size 2MB.</p>
          </CardContent>
        </Card>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="countryCode">Country Code</Label>
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => handleInputChange("countryCode", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">🇺🇸 +1 (US)</SelectItem>
                        <SelectItem value="+1">🇨🇦 +1 (CA)</SelectItem>
                        <SelectItem value="+44">🇬🇧 +44 (UK)</SelectItem>
                        <SelectItem value="+33">🇫🇷 +33 (FR)</SelectItem>
                        <SelectItem value="+49">🇩🇪 +49 (DE)</SelectItem>
                        <SelectItem value="+39">🇮🇹 +39 (IT)</SelectItem>
                        <SelectItem value="+34">🇪🇸 +34 (ES)</SelectItem>
                        <SelectItem value="+31">🇳🇱 +31 (NL)</SelectItem>
                        <SelectItem value="+46">🇸🇪 +46 (SE)</SelectItem>
                        <SelectItem value="+47">🇳🇴 +47 (NO)</SelectItem>
                        <SelectItem value="+45">🇩🇰 +45 (DK)</SelectItem>
                        <SelectItem value="+358">🇫🇮 +358 (FI)</SelectItem>
                        <SelectItem value="+41">🇨🇭 +41 (CH)</SelectItem>
                        <SelectItem value="+43">🇦🇹 +43 (AT)</SelectItem>
                        <SelectItem value="+32">🇧🇪 +32 (BE)</SelectItem>
                        <SelectItem value="+351">🇵🇹 +351 (PT)</SelectItem>
                        <SelectItem value="+353">🇮🇪 +353 (IE)</SelectItem>
                        <SelectItem value="+48">🇵🇱 +48 (PL)</SelectItem>
                        <SelectItem value="+420">🇨🇿 +420 (CZ)</SelectItem>
                        <SelectItem value="+36">🇭🇺 +36 (HU)</SelectItem>
                        <SelectItem value="+30">🇬🇷 +30 (GR)</SelectItem>
                        <SelectItem value="+90">🇹🇷 +90 (TR)</SelectItem>
                        <SelectItem value="+7">🇷🇺 +7 (RU)</SelectItem>
                        <SelectItem value="+91">🇮🇳 +91 (IN)</SelectItem>
                        <SelectItem value="+86">🇨🇳 +86 (CN)</SelectItem>
                        <SelectItem value="+81">🇯🇵 +81 (JP)</SelectItem>
                        <SelectItem value="+82">🇰🇷 +82 (KR)</SelectItem>
                        <SelectItem value="+65">🇸🇬 +65 (SG)</SelectItem>
                        <SelectItem value="+60">🇲🇾 +60 (MY)</SelectItem>
                        <SelectItem value="+66">🇹🇭 +66 (TH)</SelectItem>
                        <SelectItem value="+84">🇻🇳 +84 (VN)</SelectItem>
                        <SelectItem value="+63">🇵🇭 +63 (PH)</SelectItem>
                        <SelectItem value="+62">🇮🇩 +62 (ID)</SelectItem>
                        <SelectItem value="+61">🇦🇺 +61 (AU)</SelectItem>
                        <SelectItem value="+64">🇳🇿 +64 (NZ)</SelectItem>
                        <SelectItem value="+27">🇿🇦 +27 (ZA)</SelectItem>
                        <SelectItem value="+20">🇪🇬 +20 (EG)</SelectItem>
                        <SelectItem value="+234">🇳🇬 +234 (NG)</SelectItem>
                        <SelectItem value="+254">🇰🇪 +254 (KE)</SelectItem>
                        <SelectItem value="+55">🇧🇷 +55 (BR)</SelectItem>
                        <SelectItem value="+52">🇲🇽 +52 (MX)</SelectItem>
                        <SelectItem value="+54">🇦🇷 +54 (AR)</SelectItem>
                        <SelectItem value="+56">🇨🇱 +56 (CL)</SelectItem>
                        <SelectItem value="+57">🇨🇴 +57 (CO)</SelectItem>
                        <SelectItem value="+51">🇵🇪 +51 (PE)</SelectItem>
                        <SelectItem value="+58">🇻🇪 +58 (VE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
                <CardDescription>Update your professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password (leave blank to keep current password)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    className={errors.currentPassword ? "border-red-500" : ""}
                  />
                  {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      className={errors.newPassword ? "border-red-500" : ""}
                    />
                    {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/leads">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
