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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    newValue = newValue.replace(/\D/g, "");

    onChange(newValue);
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
      });
      setEmail([""]);
      setErrors({});
    }
  }, [open, currentUserId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.workEmail) {
      if (!emailRegex.test(formData.workEmail)) {
        newErrors.workEmail = "Work Email is invalid";
      }
    }
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.whatsUpNumber) {
      newErrors.whatsUpNumber = "whatsUpNumber is required";
    } else if (formData.whatsUpNumber.length < 10) {
      newErrors.whatsUpNumber = "WhatsApp number must be at least 10 digits";
    }

    if (!email[0] || !email[0].trim()) {
      newErrors[`email_0`] = "Email is required";
    } else if (!emailRegex.test(email[0])) {
      newErrors[`email_0`] = "Email is invalid";
    }

    email.slice(1).forEach((e, i) => {
      if (e.trim() && !emailRegex.test(e)) {
        newErrors[`email_${i + 1}`] = "Email is invalid";
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
    setErrors((prev) => {
      const newErr: Record<string, string> = { ...prev };

      Object.keys(newErr)
        .filter((key) => key.startsWith("email_"))
        .forEach((key) => delete newErr[key]);

      if (!newEmail[0] || !newEmail[0].trim()) {
        newErr[`email_0`] = "Email is required";
      } else if (!emailRegex.test(newEmail[0])) {
        newErr[`email_0`] = "Email is invalid";
      }

      newEmail.slice(1).forEach((e, i) => {
        if (e.trim() && !emailRegex.test(e)) {
          newErr[`email_${i + 1}`] = "Email is invalid";
        }
      });
      return newErr;
    });
  };

  const addEmailField = () => {
    setEmail((prev) => [...prev, ""]);
  };

  const removeEmailField = (index: number) => {
    const newEmail = email.filter((_, i) => i !== index);
    setEmail(newEmail);

    setErrors((prev) => {
      const newErr: Record<string, string> = { ...prev };

      Object.keys(newErr)
        .filter((key) => key.startsWith("email_") || key === "emails")
        .forEach((key) => delete newErr[key]);

      let hasError = false;
      newEmail.forEach((e, i) => {
        if (!e.trim()) {
          hasError = true;
        } else if (!emailRegex.test(e)) {
          newErr[`email_${i}`] = "Email is invalid";
          hasError = true;
        }
      });
      if (hasError && newEmail.every((e) => !e.trim())) {
        newErr.emails = "Email is required";
      }
      return newErr;
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const emailPayload = [email[0], ...email.slice(1).filter((e) => e.trim())];
      const payload = {
        ...formData,
        createdBy: currentUserId,
        userId: currentUserId,
        email:emailPayload,
        workEmail: formData.workEmail?.trim() ? formData.workEmail : null,
        websiteURL: formData.websiteURL?.trim() ? formData.websiteURL : null,
        linkdinURL: formData.linkdinURL?.trim() ? formData.linkdinURL : null,
      };
      console.log("AddLeadDrawer create payload:", payload);
      await createOne(LEADS_ENDPOINT, payload);
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      const server = err?.response?.data || err
      console.error("Lead save failed:", server);
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
      <SheetContent className="w-full sm:w-[400px] md:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Lead</SheetTitle>
          <SheetDescription>
            Fill in the information below to add a new lead to the system.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}
          <div>
            <Label>First name</Label>
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
            <div>
            <Label>Email address</Label>
            <div className="space-y-3">
              {email.map((emailValue, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="email"
                      value={emailValue}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="Enter Email address"
                      className={`flex-1 ${errors[`email_${index}`] ? "border-red-500" : ""}`}
                    />
                    {index === 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addEmailField}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : (
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
                  {errors[`email_${index}`] && (
                    <p className="text-sm text-red-500 mt-1">{errors[`email_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

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
 
                if (value.trim() && !emailRegex.test(value)) {
                  setErrors((prev) => ({
                    ...prev,
                    workEmail: "Work Email is invalid",
                  }));
                } else {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.workEmail;
                    return newErrors;
                  });
                }
              }}
              placeholder="Enter work email"
              className={errors.workEmail ? "border-red-500" : ""}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              name="work-email-field"
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
 
                if (value.trim() && !/^https?:\/\//i.test(value.trim())) {
                  setErrors((prev) => ({ ...prev, websiteURL: "Website URL should start with http or https" }));
                } else {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.websiteURL;
                    return newErrors;
                  });
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
 
                if (value.trim() && !/^https?:\/\//i.test(value.trim())) {
                  setErrors((prev) => ({ ...prev, linkdinURL: "LinkedIn URL should start with http or https" }));
                } else {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.linkdinURL;
                    return newErrors;
                  });
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
              onChange={(val) => {
                setFormData((s) => ({ ...s, whatsUpNumber: val }));
                if (!val.trim()) {
                  setErrors((prev) => ({ ...prev, whatsUpNumber: "WhatsApp Number is required" }));
                } else if (val.length < 10) {
                  setErrors((prev) => ({ ...prev, whatsUpNumber: "WhatsApp number must be at least 10 digits" }));
                } else {
                  setErrors((prev) => ({ ...prev, whatsUpNumber: "" }));
                }
              }}
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
