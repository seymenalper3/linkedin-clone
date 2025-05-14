"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PlusIcon, Trash2 } from "lucide-react";
import { ISkill } from "@/mongodb/models/profile";

interface SkillsSectionProps {
  skills: any[];
  onAdd: (skill: string) => Promise<boolean>;
  onDelete: (skillId: string) => Promise<void>;
}

export default function SkillsSection({
  skills,
  onAdd,
  onDelete,
}: SkillsSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSkill.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await onAdd(newSkill);
      if (success) {
        setNewSkill("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (skillId: string) => {
    await onDelete(skillId);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Skills</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newSkill" className="sr-only">Add Skill</Label>
              <Input
                id="newSkill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. JavaScript, Leadership, Photoshop)"
              />
            </div>
            <Button 
              type="submit" 
              className="btn-linkedin"
              disabled={isSubmitting || !newSkill.trim()}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </div>
      
      {skills.length === 0 ? (
        <div className="bg-accent/10 p-4 rounded-md text-center">
          <p className="text-muted-foreground">No skills added yet</p>
          <p className="text-xs mt-1">
            Add skills to help others understand your strengths
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {skills.map((skill: any) => (
            <div key={skill._id} className="flex items-center justify-between border rounded-md p-3 group">
              <div>
                <p className="font-medium">{skill.name}</p>
                {skill.endorsements > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {skill.endorsements} endorsement{skill.endorsements !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(skill._id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}