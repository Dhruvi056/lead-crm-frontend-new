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
import { updateOne } from "@/app/utils/api";
import { Plus, Trash2 } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PhoneNumberField({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [error, setError] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!/^\d*$/.test(newValue)) return;
    onChange(newValue);
    if (newValue.length > 0 && newValue.length < 10) setError("WhatsApp number must be at least 10 digits");
    else setError("");
  };
  return (
    <div className="space-y-1">
      <Input type="text" placeholder="Enter WhatsApp Number" value={value} onChange={handleChange} maxLength={10} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

interface EditLeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  leadData: any | null;
  onSaved?: () => void;
}

const LEADS_ENDPOINT = "lead";

export default function EditLeadDrawer({
  open,
  onOpenChange,
  currentUserId,
  leadData,
  onSaved,
}: EditLeadDrawerProps) {
  const [email, setEmail] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
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
    if (open && leadData) {
      const emailList = Array.isArray(leadData.email) ? leadData.email : leadData.email ? [leadData.email] : [""];
      setEmail(emailList);

      setFormData({
        firstName: leadData.firstName || "",
        websiteURL: leadData.websiteURL || "",
        linkdinURL: leadData.linkdinURL || "",
        industry: leadData.industry || "",
        whatsUpNumber: leadData.whatsUpNumber?.toString() || "",
        workEmail: leadData.workEmail || "",
        status: leadData.status || "ACTIVE",
        priority: leadData.priority || "HIGH",
        userId: leadData.userId || currentUserId,
      });

      setErrors({});
    }
  }, [open, leadData, currentUserId]);

  const handleCancel = () => onOpenChange(false);

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
      setErrors({});
    }
  };

  const addEmailField = () => setEmail((prev) => [...prev, ""]);
  const removeEmailField = (index: number) => {
    setEmail(email.filter((_, i) => i !== index));
    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr[`email_${index}`];
      return newErr;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    // websiteURL and linkdinURL optional
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.whatsUpNumber) newErrors.whatsUpNumber = "";
    else if (formData.whatsUpNumber.length < 10) newErrors.whatsUpNumber = "WhatsApp number must be at least 10 digits";

    email.forEach((e, i) => {
      if (!e) newErrors[`email_${i}`] = "Email is required";
      else if (!emailRegex.test(e)) newErrors[`email_${i}`] = "Email is invalid";
    });

    if (formData.workEmail && !emailRegex.test(formData.workEmail)) newErrors.workEmail = "Work Email is invalid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData?._id || !validateForm()) return;
    setIsSubmitting(true);

    try {
      const payload = { 
        ...formData, 
        email,
        workEmail: formData.workEmail?.trim() ? formData.workEmail : null,
        websiteURL: formData.websiteURL?.trim() ? formData.websiteURL : null,
        linkdinURL: formData.linkdinURL?.trim() ? formData.linkdinURL : null,
      };
      await updateOne(LEADS_ENDPOINT, leadData._id, payload);
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Lead update failed:", err?.message || err);
      setErrors((prev) => ({ ...prev, form: err?.message || "Something went wrong" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Lead</SheetTitle>
          <SheetDescription>Update the information below to edit the lead.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label>First Name</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData((s) => ({ ...s, firstName: e.target.value }))}
              placeholder="Enter first name"
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div>
            <Label>Email</Label>
            <div className="space-y-3">
              {email.map((e, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Input
                    type="email"
                    value={e}
                    onChange={(ev) => handleEmailChange(i, ev.target.value)}
                    placeholder={`Enter email ${i + 1}`}
                    className={errors[`email_${i}`] ? "border-red-500" : ""}
                  />
                  {email.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEmailField(i)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {Object.keys(errors)
              .filter((key) => key.startsWith("email_"))
              .map((key) => (
                <p key={key} className="text-sm text-red-500">{errors[key]}</p>
              ))}
            <Button type="button" variant="outline" className="mt-2" onClick={addEmailField}>
              <Plus className="mr-2 h-4 w-4" /> Add Email
            </Button>
          </div>

          <div>
            <Label>Work Email</Label>
            <Input
              type="email"
              value={formData.workEmail}
              onChange={(e) => setFormData((s) => ({ ...s, workEmail: e.target.value }))}
              placeholder="Enter work email"
            />
            {errors.workEmail && <p className="text-sm text-red-500">{errors.workEmail}</p>}
          </div>

          <div>
            <Label>WhatsApp Number</Label>
            <PhoneNumberField value={formData.whatsUpNumber} 
            onChange={(val) => setFormData((s) => ({ ...s, whatsUpNumber: val }))} />
            {errors.whatsUpNumber && <p className="text-sm text-red-500">{errors.whatsUpNumber}</p>}
          </div>

          <div>
            <Label>Website URL</Label>
            <Input value={formData.websiteURL} 
            onChange={(e) => setFormData((s) => ({ ...s, websiteURL: e.target.value }))}
             placeholder="https://example.com" />
            {errors.websiteURL && <p className="text-sm text-red-500">{errors.websiteURL}</p>}
          </div>

          {/* LinkedIn */}
          <div>
            <Label>LinkedIn URL</Label>
            <Input value={formData.linkdinURL} onChange={(e) => setFormData((s) => ({ ...s, linkdinURL: e.target.value }))} placeholder="https://linkedin.com/in/..." />
            {errors.linkdinURL && <p className="text-sm text-red-500">{errors.linkdinURL}</p>}
          </div>

          {/* Industry */}
          <div>
            <Label>Industry</Label>
            <Input value={formData.industry} onChange={(e) => setFormData((s) => ({ ...s, industry: e.target.value }))} placeholder="Enter industry" />
            {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData((s) => ({ ...s, status: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <Label>Priority</Label>
            <Select value={formData.priority} onValueChange={(value: any) => setFormData((s) => ({ ...s, priority: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}
          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
