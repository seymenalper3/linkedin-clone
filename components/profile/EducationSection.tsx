"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Calendar } from "../ui/calendar";
import { CalendarIcon, PlusIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { IEducation } from "@/mongodb/models/profile";

interface EducationSectionProps {
  education: any[];
  onAdd: (education: any) => Promise<boolean>;
  onDelete: (educationId: string) => Promise<void>;
}

export default function EducationSection({
  education,
  onAdd,
  onDelete,
}: EducationSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState<IEducation>({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startYear: currentYear,
    endYear: undefined,
    description: "",
    isCurrentlyStudying: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleNumberInput = (name: string, value: string) => {
    const numberValue = parseInt(value);
    if (!isNaN(numberValue)) {
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    }
  };
  
  const resetForm = () => {
    setFormData({
      school: "",
      degree: "",
      fieldOfStudy: "",
      startYear: currentYear,
      endYear: undefined,
      description: "",
      isCurrentlyStudying: false
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.school) {
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
  
  const handleDelete = async (educationId: string) => {
    if (confirm("Are you sure you want to delete this education entry?")) {
      await onDelete(educationId);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Education</h2>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            variant="outline"
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Education
          </Button>
        )}
      </div>
      
      {education.length === 0 && !showForm && (
        <div className="bg-accent/10 p-4 rounded-md text-center">
          <p className="text-muted-foreground">No education added yet</p>
          <Button 
            onClick={() => setShowForm(true)} 
            variant="link" 
            className="mt-2"
          >
            Add your education history
          </Button>
        </div>
      )}
      
      {education.length > 0 && (
        <div className="space-y-4">
          {education.map((edu: any) => (
            <div key={edu._id} className="border rounded-md p-4 relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(edu._id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              
              <h3 className="font-semibold">{edu.school}</h3>
              
              {edu.degree && edu.fieldOfStudy && (
                <p className="text-sm">{edu.degree} in {edu.fieldOfStudy}</p>
              )}
              
              <p className="text-sm text-muted-foreground">
                {edu.startYear} - {edu.isCurrentlyStudying ? "Present" : edu.endYear}
              </p>
              
              {edu.description && (
                <p className="text-sm mt-2">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-md p-4 space-y-4">
          <div>
            <Label htmlFor="school">School/University *</Label>
            <Input
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="Harvard University"
              required
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="Bachelor's"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="fieldOfStudy">Field of Study</Label>
              <Input
                id="fieldOfStudy"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="Computer Science"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startYear">Start Year</Label>
              <Input
                id="startYear"
                name="startYear"
                type="number"
                min="1900"
                max={currentYear}
                value={formData.startYear}
                onChange={(e) => handleNumberInput("startYear", e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="endYear">End Year</Label>
              <Input
                id="endYear"
                name="endYear"
                type="number"
                min="1900"
                max={currentYear + 10}
                value={formData.endYear || ""}
                onChange={(e) => handleNumberInput("endYear", e.target.value)}
                disabled={formData.isCurrentlyStudying}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCurrentlyStudying"
              checked={formData.isCurrentlyStudying}
              onCheckedChange={(checked) => 
                handleCheckboxChange("isCurrentlyStudying", checked as boolean)
              }
            />
            <Label htmlFor="isCurrentlyStudying">
              I am currently studying here
            </Label>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your studies, activities, etc."
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
              disabled={isSubmitting || !formData.school}
            >
              {isSubmitting ? "Saving..." : "Save Education"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}