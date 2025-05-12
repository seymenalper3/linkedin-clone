"use client";

import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/user";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast.error("Please select a role to continue");
      return;
    }

    // Validate the role is one of the allowed values
    if (selectedRole !== 'employee' && selectedRole !== 'employer') {
      toast.error("Invalid role selection");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to save the user role
      const response = await fetch("/api/users/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to save role");
      }

      toast.success("Role set successfully!");
      
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error setting user role:", error);
      toast.error("Failed to set role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-20">
      <h1 className="text-2xl font-bold text-center mb-6">Select Your Role</h1>
      <p className="text-gray-600 mb-8 text-center">
        Choose your role to personalize your LinkedIn experience
      </p>
      
      <div className="space-y-4 mb-8">
        <RoleCard
          title="Employee"
          description="I'm looking for job opportunities and want to connect with others"
          isSelected={selectedRole === "employee"}
          onClick={() => setSelectedRole("employee")}
        />
        
        <RoleCard
          title="Employer"
          description="I want to post job listings and find candidates"
          isSelected={selectedRole === "employer"}
          onClick={() => setSelectedRole("employer")}
        />
      </div>
      
      <Button 
        className="w-full" 
        onClick={handleRoleSelection}
        disabled={!selectedRole || isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}

interface RoleCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

function RoleCard({ title, description, isSelected, onClick }: RoleCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${
          isSelected ? "border-blue-500" : "border-gray-300"
        }`}>
          {isSelected && <div className="w-3 h-3 rounded-full bg-blue-500" />}
        </div>
        <div>
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}