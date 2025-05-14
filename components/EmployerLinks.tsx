"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Badge } from "./ui/badge";

export default function EmployerLinks() {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationCount, setApplicationCount] = useState(0);
  const [hasViewedApplications, setHasViewedApplications] = useState(false);

  // Check if currently on the applications page
  const isApplicationsPage = pathname === "/applications";

  useEffect(() => {
    // If user has viewed the applications page, mark as viewed
    if (isApplicationsPage && !hasViewedApplications) {
      setHasViewedApplications(true);
      // Reset counter when visiting the applications page
      setApplicationCount(0);
      
      // Save this state to localStorage
      localStorage.setItem('lastApplicationsViewed', new Date().toISOString());
    }
  }, [isApplicationsPage, hasViewedApplications]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        const roleRes = await fetch("/api/users/check-role");
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          setUserRole(roleData.role);

          // If user is an employer, fetch pending application count
          if (roleData.role === "employer") {
            const lastViewed = localStorage.getItem('lastApplicationsViewed');
            
            const appRes = await fetch("/api/job-applications?type=employer");
            if (appRes.ok) {
              const appData = await appRes.json();
              
              // If we have a last viewed timestamp, only count applications that came after
              if (lastViewed) {
                // Count pending applications that came after last viewed
                const lastViewedDate = new Date(lastViewed);
                const newApps = appData.applications?.filter(
                  (app: any) => 
                    app.status === "pending" && 
                    new Date(app.createdAt) > lastViewedDate
                );
                setApplicationCount(newApps?.length || 0);
              } else {
                // Count all pending applications if never viewed
                const pendingApps = appData.applications?.filter(
                  (app: any) => app.status === "pending"
                );
                setApplicationCount(pendingApps?.length || 0);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
    
    // Set up an interval to check for new applications every minute
    const intervalId = setInterval(fetchUserRole, 60000);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading || userRole !== "employer") {
    return null;
  }
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Mark as viewed immediately when clicking
    setHasViewedApplications(true);
    setApplicationCount(0);
    // Save to localStorage
    localStorage.setItem('lastApplicationsViewed', new Date().toISOString());
    // Navigate to applications page
    router.push('/applications');
  };

  return (
    <a 
      href="/applications" 
      className="icon px-3 py-1.5 relative cursor-pointer"
      onClick={handleClick}
    >
      <ClipboardList className="h-5 w-5" />
      <p>Applications</p>
      {applicationCount > 0 && !isApplicationsPage && (
        <Badge className="absolute -top-1 -right-1 bg-red-500">
          {applicationCount}
        </Badge>
      )}
    </a>
  );
}