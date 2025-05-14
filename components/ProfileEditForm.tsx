"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BasicInfoForm from "./profile/BasicInfoForm";
import EducationSection from "./profile/EducationSection";
import ExperienceSection from "./profile/ExperienceSection";
import SkillsSection from "./profile/SkillsSection";
import ProfileOverview from "./profile/ProfileOverview";

interface ProfileEditFormProps {
  initialProfile: any;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  }
}

export default function ProfileEditForm({ initialProfile, user }: ProfileEditFormProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  
  // Save the basic profile info
  const handleSaveBasicInfo = async (basicInfo: any) => {
    setIsSaving(true);
    
    try {
      const updatedProfile = { ...profile, ...basicInfo };
      
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save profile");
      }
      
      const data = await response.json();
      setProfile(data.profile);
      toast.success("Profile saved successfully");
      router.refresh();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add education entry
  const handleAddEducation = async (education: any) => {
    try {
      const response = await fetch("/api/profile/education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(education),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add education");
      }
      
      const data = await response.json();
      setProfile({ ...profile, education: data.education });
      toast.success("Education added successfully");
      router.refresh();
      return true;
    } catch (error) {
      console.error("Error adding education:", error);
      toast.error("Failed to add education");
      return false;
    }
  };
  
  // Delete education entry
  const handleDeleteEducation = async (educationId: string) => {
    try {
      const response = await fetch(`/api/profile/education/${educationId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete education");
      }
      
      const data = await response.json();
      setProfile({ ...profile, education: data.education });
      toast.success("Education removed successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("Failed to delete education");
    }
  };
  
  // Add experience entry
  const handleAddExperience = async (experience: any) => {
    try {
      const response = await fetch("/api/profile/experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(experience),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add experience");
      }
      
      const data = await response.json();
      setProfile({ ...profile, experience: data.experience });
      toast.success("Experience added successfully");
      router.refresh();
      return true;
    } catch (error) {
      console.error("Error adding experience:", error);
      toast.error("Failed to add experience");
      return false;
    }
  };
  
  // Delete experience entry
  const handleDeleteExperience = async (experienceId: string) => {
    try {
      const response = await fetch(`/api/profile/experience/${experienceId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete experience");
      }
      
      const data = await response.json();
      setProfile({ ...profile, experience: data.experience });
      toast.success("Experience removed successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("Failed to delete experience");
    }
  };
  
  // Add skill
  const handleAddSkill = async (skill: string) => {
    try {
      if (!skill.trim()) {
        toast.error("Skill name is required");
        return false;
      }
      
      const response = await fetch("/api/profile/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: skill }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        if (data.message.includes("already exists")) {
          toast.error("Skill already exists in your profile");
          return false;
        }
        throw new Error("Failed to add skill");
      }
      
      const data = await response.json();
      setProfile({ ...profile, skills: data.skills });
      toast.success("Skill added successfully");
      router.refresh();
      return true;
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
      return false;
    }
  };
  
  // Delete skill
  const handleDeleteSkill = async (skillId: string) => {
    try {
      const response = await fetch(`/api/profile/skills/${skillId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete skill");
      }
      
      const data = await response.json();
      setProfile({ ...profile, skills: data.skills });
      toast.success("Skill removed successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Failed to delete skill");
    }
  };
  
  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ProfileOverview 
            profile={profile} 
            user={user}
            onEditSection={(section) => setActiveTab(section)}
          />
        </TabsContent>
        
        <TabsContent value="basic">
          <BasicInfoForm 
            profileData={profile} 
            onSave={handleSaveBasicInfo}
            isSaving={isSaving}
          />
        </TabsContent>
        
        <TabsContent value="education">
          <EducationSection 
            education={profile.education || []} 
            onAdd={handleAddEducation}
            onDelete={handleDeleteEducation}
          />
        </TabsContent>
        
        <TabsContent value="experience">
          <ExperienceSection 
            experience={profile.experience || []} 
            onAdd={handleAddExperience}
            onDelete={handleDeleteExperience}
          />
        </TabsContent>
        
        <TabsContent value="skills">
          <SkillsSection 
            skills={profile.skills || []} 
            onAdd={handleAddSkill}
            onDelete={handleDeleteSkill}
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => router.push("/")}>
          Cancel
        </Button>
        
        <Button 
          variant="default" 
          className="btn-linkedin"
          onClick={() => {
            toast.success("Profile updated successfully");
            router.push("/");
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
}