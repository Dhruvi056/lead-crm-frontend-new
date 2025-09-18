"use client"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createOne, updateOne } from "@/app/utils/api"
import { Eye, EyeOff } from "lucide-react";

interface AddUserDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (user?: any) => void
  userData?: any | null
}

const AUTH_ENDPOINT = "auth"
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/

export function AddUserDrawer({ open, onOpenChange, onSaved, userData }: AddUserDrawerProps) {
  const [formData, setFormData] = useState({
    _id: undefined as string | undefined,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "Admin",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = Boolean(userData && (userData as any)._id)

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setFormData({
          _id: String(userData?._id ?? ""),
          firstName: String(userData?.firstName ?? ""),
          lastName: String(userData?.lastName ?? ""),
          email: String(userData?.email ?? ""),
          phoneNumber: String(userData?.phoneNumber ?? ""),
          password: "",
          role: String(userData?.role ?? "Admin"),
        })
      } else {
        resetForm()
      }
      setErrors({})
    } else {
      resetForm()
      setErrors({})
    }
  }, [open, userData])

  const resetForm = useCallback(() => {
    setFormData({
      _id: undefined,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "Admin",
    })
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }

      if (field === "firstName") {
        if (!value.trim()) newErrors.firstName = "First Name is required"
        else delete newErrors.firstName
      }

      if (field === "lastName") {
        if (!value.trim()) newErrors.lastName = "Last Name is required"
        else delete newErrors.lastName
      }

      if (field === "email") {
        if (!value.trim()) newErrors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = "Invalid email format"
        else delete newErrors.email
      }

      if (field === "phoneNumber") {
        if (!value.trim()) newErrors.phoneNumber = "Phone Number is required"
        else if (!/^\d{10}$/.test(value)) newErrors.phoneNumber = "Phone number must be 10 digits"
        else delete newErrors.phoneNumber
      }

      if (field === "password" && !isEdit) {
        if (!value.trim()) newErrors.password = "Password is required"
        else if (!strongPasswordRegex.test(value))
          newErrors.password =
            "Password must be at least 6 characters and include uppercase, lowercase, number and symbol"
        else delete newErrors.password
      }

      return newErrors
    })
  }

  const validateAll = () => {
    const fields: Record<string, string> = {}
    if (!formData.firstName.trim()) fields.firstName = "First Name is required"
    if (!formData.lastName.trim()) fields.lastName = "Last Name is required"
    if (!formData.email.trim()) fields.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) fields.email = "Invalid email format"
    if (!formData.phoneNumber.trim()) fields.phoneNumber = "Phone Number is required"
    else if (!/^\d{10}$/.test(formData.phoneNumber)) fields.phoneNumber = "Phone number must be 10 digits"

    if (!isEdit) {
      if (!formData.password.trim()) fields.password = "Password is required"
      else if (!strongPasswordRegex.test(formData.password))
        fields.password = "Password must be at least 6 characters and include uppercase, lowercase, number and symbol"
    }

    setErrors(fields)
    return Object.keys(fields).length === 0
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateAll()) {
        // ❌ show red borders + error text (no toast)
        return
      }

      setIsSubmitting(true)
      try {
        if (formData._id) {
          const { _id, ...rest } = formData
          await updateOne(AUTH_ENDPOINT, _id, rest)
          toast.success("User updated successfully")
        } else {
          await createOne("auth/register", formData)
          toast.success("User created successfully")
        }

        onSaved?.(formData)
        onOpenChange(false)
      } catch (error: any) {
        toast.error(error.message || "Something went wrong")
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, onOpenChange, onSaved, isEdit]
  )

  const handleCancel = useCallback(() => {
    resetForm()
    setErrors({})
    onOpenChange(false)
  }, [resetForm, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit User" : "Add New User"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update the user details." : "Fill in the information below to add a new user to the system."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6" noValidate>
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Enter first name"
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Enter last name"
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formData.phoneNumber}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10)
                handleChange("phoneNumber", digitsOnly)
              }}
              placeholder="Enter phone number"
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>

          {/* Password (only on create) */}
          {!isEdit && (
            <div className="space-y-2 relative">
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type={showPassword ? "text" : "password"}
    value={formData.password}
    onChange={(e) => handleChange("password", e.target.value)}
    placeholder="Enter password"
    className={errors.password ? "border-red-500 pr-10" : "pr-10"} // pr-10 for icon space
  />
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-[38px] text-gray-500"
    tabIndex={-1}
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
  {errors.password && (
    <p className="text-sm text-red-500">{errors.password}</p>
  )}
</div>

          )}

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save" : "Submit"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
