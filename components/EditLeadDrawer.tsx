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
   const newValue = e.target.value.replace(/\D/g, "");

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
      });

      setErrors({});
    }
  }, [open, leadData, currentUserId]);

  const handleCancel = () => onOpenChange(false);

  const handleEmailChange = (index: number, value: string) => {
    const newEmail = [...email];
    newEmail[index] = value;
    setEmail(newEmail);

   setErrors((prev) => {
      const newErr: Record<string, string> = { ...prev };
      Object.keys(newErr).filter((key) => key.startsWith("email_")).forEach((key) => delete newErr[key]);
 
      if (!newEmail[0].trim()) newErr[`email_0`] = "Email is required";
      else if (!emailRegex.test(newEmail[0])) newErr[`email_0`] = "Email is invalid";
 
      newEmail.slice(1).forEach((e, i) => {
        if (e.trim() && !emailRegex.test(e)) newErr[`email_${i + 1}`] = "Email is invalid";
      });
 
      return newErr;
    });
  };


const addEmailField = () => setEmail((prev) => [...prev, ""]);
  const removeEmailField = (index: number) => {
    const newEmail = email.filter((_, i) => i !== index);
    setEmail(newEmail);
 
    setErrors((prev) => {
      const newErr: Record<string, string> = { ...prev };
      Object.keys(newErr).filter((key) => key.startsWith("email_")).forEach((key) => delete newErr[key]);
 
      if (!newEmail[0]?.trim()) newErr[`email_0`] = "Email is required";
      else if (!emailRegex.test(newEmail[0])) newErr[`email_0`] = "Email is invalid";
 
      newEmail.slice(1).forEach((e, i) => {
        if (e.trim() && !emailRegex.test(e)) newErr[`email_${i + 1}`] = "Email is invalid";
      });
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

   if (!email[0]?.trim()) newErrors[`email_0`] = "Email is required";
    else if (!emailRegex.test(email[0])) newErrors[`email_0`] = "Email is invalid";
 
    email.slice(1).forEach((e, i) => {
      if (e.trim() && !emailRegex.test(e)) newErrors[`email_${i + 1}`] = "Email is invalid";
    });
 
    if (formData.workEmail?.trim() && !emailRegex.test(formData.workEmail)) newErrors.workEmail = "Work Email is invalid";
    if (formData.websiteURL?.trim() && !/^https?:\/\//i.test(formData.websiteURL)) newErrors.websiteURL = "Website URL must start with http or https";
    if (formData.linkdinURL?.trim() && !/^https?:\/\//i.test(formData.linkdinURL)) newErrors.linkdinURL = "LinkedIn URL must start with http or https";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData?._id || !validateForm()) return;
    setIsSubmitting(true);

    try {
      const emailPayload = [email[0], ...email.slice(1).filter((e) => e.trim())];
      const payload = { 
        ...formData, 
        updatedBy: currentUserId,
        userId: currentUserId,
        email:emailPayload,
        workEmail: formData.workEmail?.trim() ? formData.workEmail : null,
        websiteURL: formData.websiteURL?.trim() ? formData.websiteURL : null,
        linkdinURL: formData.linkdinURL?.trim() ? formData.linkdinURL : null,
      };
      console.log("EditLeadDrawer update payload:", payload);
      await updateOne(LEADS_ENDPOINT, leadData._id, payload);
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      const server = err?.response?.data || err;
      console.error("Lead update failed:", server);
      let message = server?.message || server?.error || err?.message || "Something went wrong";
      if (server?.errors) {
        try {
          const details = Array.isArray(server.errors)
            ? server.errors.join(", ")
            : typeof server.errors === 'object'
              ? Object.values(server.errors).map((v:any)=>Array.isArray(v)?v[0]:v).join(", ")
              : String(server.errors);
          if (details) message = details;
        } catch {}
      }
      setErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-full sm:w-[400px] md:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Lead</SheetTitle>
          <SheetDescription>Update the information below to edit the lead.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}

          <div>
            <Label>First name</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData((s) => ({ ...s, firstName: e.target.value }))}
              placeholder="Enter first name"
              className={errors.firstName ? "border-red-500" : ""}

            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div>
            <Label>Email address</Label>
            <div className="space-y-3">
              {email.map((e, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      value={e}
                      onChange={(ev) => handleEmailChange(i, ev.target.value)}
                      placeholder="Enter Email address"
                      className={errors[`email_${i}`] ? "border-red-500" : ""}
                    />
                    {errors[`email_${i}`] && (
                      <p className="text-sm text-red-500">{errors[`email_${i}`]}</p>
                    )}
                  </div>
 
                  {i === 0 ? (
                    <Button type="button" variant="outline" size="icon" onClick={addEmailField}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEmailField(i)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
          <div>
            <Label>WhatsApp number</Label>
            <PhoneNumberField value={formData.whatsUpNumber}
              onChange={(val) => setFormData((s) => ({ ...s, whatsUpNumber: val }))} />
            {errors.whatsUpNumber && <p className="text-sm text-red-500">{errors.whatsUpNumber}</p>}
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
