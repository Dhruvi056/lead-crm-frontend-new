"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createOne } from "@/app/utils/api";
import { Plus, Trash2 } from "lucide-react";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function PhoneNumberField({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
}) {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!/^\d*$/.test(newValue)) return;

    onChange(newValue);

    if (newValue.length > 0 && newValue.length < 10) {
      setError("WhatsApp number must be at least 10 digits");
    } else {
      setError("");
    }
  };
  return (
    <div className="space-y-1">
      <Input
        type="text"
        placeholder="Enter WhatsApp Number"
        value={value}
        onChange={handleChange}
        maxLength={10}
        className={hasError ? "border-red-500" : ""}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
interface AddLeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  currentUserId: string;
}
const LEADS_ENDPOINT = "lead";

export default function AddLeadDrawer({
  open,
  onOpenChange,
  onSaved,
  currentUserId,
}: AddLeadDrawerProps) {
  const [email, setEmail] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    websiteURL: "",
    linkdinURL: "",
    industry: "",
    whatsUpNumber: "",
    workEmail: "",
    status: "ACTIVE",
    priority: "HIGH",
    userId: currentUserId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {

      setFormData({
        email: "",
        firstName: "",
        websiteURL: "",
        linkdinURL: "",
        industry: "",
        whatsUpNumber: "",
        workEmail: "",
        status: "ACTIVE",
        priority: "HIGH",
        userId: currentUserId,
      });
      setErrors({});
    }
  }, [open, currentUserId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.workEmail) {
      newErrors.workEmail = "Work Email is required";
    } else if (!emailRegex.test(formData.workEmail)) {
      newErrors.workEmail = "Work Email is invalid";
    }
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.websiteURL) newErrors.websiteURL = "Website URL is required";
    if (!formData.linkdinURL) newErrors.linkdinURL = "LinkedIn URL is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.whatsUpNumber) {
      newErrors.whatsUpNumber = "";
    } else if (formData.whatsUpNumber.length < 10) {
      newErrors.whatsUpNumber = "WhatsApp number must be at least 10 digits";
    }

    email.forEach((email, index) => {
      if (!email) {
        newErrors[`email_${index}`] = "Email is required";
      } else if (!emailRegex.test(email)) {
        newErrors[`email_${index}`] = "Email is invalid";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmail = [...email];
    newEmail[index] = value;
    setEmail(newEmail);

    if (!value) {
      setErrors((prev) => ({ ...prev, [`email_${index}`]: "Email is required" }));
    } else if (!emailRegex.test(value)) {
      setErrors((prev) => ({ ...prev, [`email_${index}`]: "Email is invalid" }));
    } else {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[`email_${index}`];
        return newErr;
      });
    }
  };

  const addEmailField = () => {
    setEmail((prev) => [...prev, ""]);
  };

  const removeEmailField = (index: number) => {
    const newEmail = email.filter((_, i) => i !== index);
    setEmail(newEmail);
    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr[`email_${index}`];
      return newErr;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const payload = { ...formData, email };
      await createOne(LEADS_ENDPOINT, payload);
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Lead save failed:", err?.message || err);
      const server = err?.response?.data || err
      let fieldErrors: Record<string, string> = {}
      const message = server?.message || server?.error || err?.message || "Something went wrong"
      if (server?.errors && typeof server.errors === 'object') {
        Object.entries(server.errors).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? String(val[0]) : String(val)
          fieldErrors[key] = msg
        })
      }
      setErrors((prev) => ({ ...prev, ...fieldErrors, form: message }))
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Lead</SheetTitle>
          <SheetDescription>
            Fill in the information below to add a new lead to the system.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}
          <div>
            <Label>First Name</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => {
                const value = e.target.value
                setFormData({ ...formData, firstName: value })
                if (!value.trim()) {
                  setErrors((prev) => ({ ...prev, firstName: "FirstName is required" }))
                } else {
                  setErrors((prev) => ({ ...prev, firstName: "" }))
                }
              }}
              placeholder="Enter first name"
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <div className="space-y-3">
              {email.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder={`Enter email ${index + 1}`}
                    className={errors[`email_${index}`] ? "border-red-500" : ""}
                  />
                  {email.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmailField(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {Object.keys(errors)
              .filter((key) => key.startsWith("email_"))
              .map((key) => (
                <p key={key} className="text-sm text-red-500">
                  {errors[key]}
                </p>
              ))}
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={addEmailField}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Email
            </Button>
          </div>

          {/*  Work Email */}
          <div>
            <Label>Work Email</Label>
            <Input
              type="email"
              value={formData.workEmail}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((s) => ({ ...s, workEmail: value }));

                if (value === "") {
                  setErrors((prev) => ({
                    ...prev,
                    workEmail: "Work Email is required",
                  }));
                } else if (!emailRegex.test(value)) {
                  setErrors((prev) => ({
                    ...prev,
                    workEmail: "Work Email is invalid",
                  }));
                } else {
                  setErrors((prev) => ({ ...prev, workEmail: "" }));
                }
              }}
              placeholder="Enter work email"
              className={errors.workEmail ? "border-red-500" : ""}
            />
            {errors.workEmail && (
              <p className="text-sm text-red-500">{errors.workEmail}</p>
            )}
          </div>
          <div>
            <Label>Website URL</Label>
            <Input
              value={formData.websiteURL}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, websiteURL: value });
                if (!value.trim()) {
                  setErrors((prev) => ({ ...prev, websiteURL: "Website URL is required" }));
                } else {
                  setErrors((prev) => ({ ...prev, websiteURL: "" }));
                }
              }}
              placeholder="https://example.com"
              className={errors.websiteURL ? "border-red-500" : ""}
            />
            {errors.websiteURL && <p className="text-sm text-red-500">{errors.websiteURL}</p>}
          </div>
          <div>
            <Label>LinkedIn URL</Label>
            <Input
              value={formData.linkdinURL}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, linkdinURL: value });
                if (!value.trim()) {
                  setErrors((prev) => ({ ...prev, linkdinURL: "LinkedIn URL is required" }));
                } else {
                  setErrors((prev) => ({ ...prev, linkdinURL: "" }));
                }
              }}
              placeholder="https://linkedin.com/in/..."
              className={errors.linkdinURL ? "border-red-500" : ""}
            />
            {errors.linkdinURL && <p className="text-sm text-red-500">{errors.linkdinURL}</p>}
          </div>
          <div>
            <Label>Industry</Label>
            <Input
              value={formData.industry}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, industry: value });
                if (!value.trim()) {
                  setErrors((prev) => ({ ...prev, industry: "Industry is required" }));
                } else {
                  setErrors((prev) => ({ ...prev, industry: "" }));
                }
              }}
              placeholder="Enter industry"
              className={errors.industry ? "border-red-500" : ""}
            />
            {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
          </div>
          <div>
            <Label>WhatsApp Number</Label>
            <PhoneNumberField
              value={formData.whatsUpNumber}
              onChange={(val) => setFormData((s) => ({ ...s, whatsUpNumber: val }))}
              hasError={Boolean(errors.whatsUpNumber)}
            />
            {errors.whatsUpNumber && <p className="text-sm text-red-500">{errors.whatsUpNumber}</p>}
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData((s) => ({ ...s, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData((s) => ({ ...s, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Submit"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
