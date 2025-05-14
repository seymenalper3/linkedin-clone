"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface BasicInfoFormProps {
  profileData: any;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
}

export default function BasicInfoForm({ 
  profileData, 
  onSave,
  isSaving
}: BasicInfoFormProps) {
  const [formData, setFormData] = useState({
    headline: profileData.headline || "",
    location: profileData.location || "",
    website: profileData.website || "",
    about: profileData.about || "",
    phoneNumber: profileData.phoneNumber || "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="headline">Professional Headline</Label>
          <Input 
            id="headline"
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            placeholder="Software Engineer at Example Inc."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            A brief professional tagline that appears under your name
          </p>
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="San Francisco, CA"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
            type="url"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input 
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1 123 456 7890"
            type="tel"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Only visible to your connections
          </p>
        </div>
        
        <div>
          <Label htmlFor="about">About</Label>
          <Textarea 
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={6}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Highlight your experience, skills, and interests
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="btn-linkedin"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}