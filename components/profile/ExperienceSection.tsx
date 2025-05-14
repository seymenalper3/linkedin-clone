"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { PlusIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { IExperience } from "@/mongodb/models/profile";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ExperienceSectionProps {
  experience: any[];
  onAdd: (experience: any) => Promise<boolean>;
  onDelete: (experienceId: string) => Promise<void>;
}

export default function ExperienceSection({
  experience,
  onAdd,
  onDelete,
}: ExperienceSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<IExperience>>({
    title: "",
    company: "",
    location: "",
    startDate: new Date(),
    endDate: undefined,
    description: "",
    isCurrentPosition: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };
  
  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      startDate: new Date(),
      endDate: undefined,
      description: "",
      isCurrentPosition: false
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.company || !formData.startDate) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await onAdd(formData);
      if (success) {
        setShowForm(false);
        resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (experienceId: string) => {
    if (confirm("Are you sure you want to delete this experience entry?")) {
      await onDelete(experienceId);
    }
  };
  
  function formatDate(date: Date | string | undefined): string {
    if (!date) return "";
    return format(new Date(date), "MMM yyyy");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Work Experience</h2>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            variant="outline"
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Experience
          </Button>
        )}
      </div>
      
      {experience.length === 0 && !showForm && (
        <div className="bg-accent/10 p-4 rounded-md text-center">
          <p className="text-muted-foreground">No work experience added yet</p>
          <Button 
            onClick={() => setShowForm(true)} 
            variant="link" 
            className="mt-2"
          >
            Add your work history
          </Button>
        </div>
      )}
      
      {experience.length > 0 && (
        <div className="space-y-4">
          {experience.map((exp: any) => (
            <div key={exp._id} className="border rounded-md p-4 relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(exp._id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              
              <h3 className="font-semibold">{exp.title}</h3>
              <p className="text-sm">{exp.company}</p>
              
              {exp.location && (
                <p className="text-xs text-muted-foreground">{exp.location}</p>
              )}
              
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(exp.startDate)} - {exp.isCurrentPosition ? "Present" : formatDate(exp.endDate)}
              </p>
              
              {exp.description && (
                <p className="text-sm mt-2">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-md p-4 space-y-4">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Software Engineer"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Google"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Mountain View, CA"
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleDateChange("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left mt-1"
                    disabled={formData.isCurrentPosition}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleDateChange("endDate", date)}
                    initialFocus
                    disabled={(date) => date < (formData.startDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCurrentPosition"
              checked={formData.isCurrentPosition}
              onCheckedChange={(checked) => 
                handleCheckboxChange("isCurrentPosition", checked as boolean)
              }
            />
            <Label htmlFor="isCurrentPosition">
              I currently work here
            </Label>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your responsibilities and achievements"
              rows={3}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="btn-linkedin"
              disabled={isSubmitting || !formData.title || !formData.company || !formData.startDate}
            >
              {isSubmitting ? "Saving..." : "Save Experience"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}