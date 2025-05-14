"use client";

import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/user";
import { useState } from "react";
import { toast } from "sonner";

interface RoleChangeModalProps {
  currentRole: UserRole | null;
  onClose: () => void;
  onRoleChanged: (newRole: UserRole) => void;
}

export default function RoleChangeModal({
  currentRole,
  onClose,
  onRoleChanged,
}: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleUpdate = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    // Validate the role is one of the allowed values
    if (selectedRole !== "employee" && selectedRole !== "employer") {
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

      toast.success("Role updated successfully!");
      onRoleChanged(selectedRole);
      onClose();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Change Your Role</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Changing your role will affect what type of content you can create.
          Your existing posts will remain unchanged.
        </p>

        <div className="space-y-3 mb-6">
          <div
            className={`p-3 border rounded-md cursor-pointer ${
              selectedRole === "employee"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground"
            }`}
            onClick={() => setSelectedRole("employee")}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  selectedRole === "employee"
                    ? "border-primary"
                    : "border border-muted-foreground"
                }`}
              >
                {selectedRole === "employee" && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="font-medium">Employee</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              For job seekers and professionals
            </p>
          </div>

          <div
            className={`p-3 border rounded-md cursor-pointer ${
              selectedRole === "employer"
                ? "border-secondary bg-secondary/5"
                : "border-border hover:border-muted-foreground"
            }`}
            onClick={() => setSelectedRole("employer")}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  selectedRole === "employer"
                    ? "border-secondary"
                    : "border border-muted-foreground"
                }`}
              >
                {selectedRole === "employer" && (
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                )}
              </div>
              <span className="font-medium">Employer</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              For posting job opportunities
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRoleUpdate}
            disabled={isSubmitting || selectedRole === currentRole}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}