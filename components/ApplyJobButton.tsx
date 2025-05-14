"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import applyJobAction from "@/actions/applyJobAction";
import { toast } from "sonner";
import { IUser } from "@/types/user";
import { Loader2 } from "lucide-react";

interface ApplyJobButtonProps {
  postId: string;
  employer: IUser;
}

export default function ApplyJobButton({ postId, employer }: ApplyJobButtonProps) {
  const { user, isLoaded } = useUser();
  const [hasApplied, setHasApplied] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check if user already applied
  useEffect(() => {
    if (!user || !isLoaded) return;

    const checkApplication = async () => {
      try {
        setIsChecking(true);
        // Fetch user role
        const roleRes = await fetch("/api/users/check-role");
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          setUserRole(roleData.role);
        }

        // Check if user has applied
        const res = await fetch(`/api/job-applications/check?postId=${postId}`);
        if (res.ok) {
          const data = await res.json();
          setHasApplied(data.hasApplied);
        }
      } catch (error) {
        console.error("Error checking application status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkApplication();
  }, [user, isLoaded, postId]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply");
      return;
    }

    if (userRole !== "employee") {
      toast.error("Only employees can apply for jobs");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await applyJobAction(postId);

      if (result.success) {
        toast.success("Application submitted successfully!");
        setHasApplied(true);
      } else {
        toast.error(result.message || "Failed to apply");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <Button disabled className="btn-linkedin">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (hasApplied) {
    return (
      <Button disabled className="bg-green-600 hover:bg-green-700">
        Applied ✓
      </Button>
    );
  }

  return (
    <Button
      className="btn-linkedin"
      onClick={handleApply}
      disabled={isSubmitting || userRole !== "employee"}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Applying...
        </>
      ) : (
        "Apply Now"
      )}
    </Button>
  );
}