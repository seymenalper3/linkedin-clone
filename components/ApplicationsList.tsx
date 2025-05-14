"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { IPostDocument } from "@/mongodb/models/post";
import Link from "next/link";
import ReactTimeago from "react-timeago";
import { Loader2 } from "lucide-react";
import { ApplicationStatus } from "@/mongodb/models/application";

// Interface for application data
interface ApplicationData {
  _id: string;
  postId: string;
  employer: {
    userId: string;
    userImage: string;
    firstName: string;
    lastName: string;
  };
  applicant: {
    userId: string;
    userImage: string;
    firstName: string;
    lastName: string;
  };
  coverLetter?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

// Props for ApplicationsList component
interface ApplicationsListProps {
  employerId: string;
}

// Status badge for applications
function StatusBadge({ status }: { status: ApplicationStatus }) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
    case 'reviewing':
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Reviewing</Badge>;
    case 'accepted':
      return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Accepted</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function ApplicationsList({ employerId }: ApplicationsListProps) {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobPosts, setJobPosts] = useState<Record<string, IPostDocument>>({});
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all applications made to this employer's posts
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/job-applications?type=employer`);
        
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
          
          // Get unique post IDs to fetch job details
          const postIds = [...new Set(data.applications.map((app: ApplicationData) => app.postId))];
          
          // Fetch details for each job post
          const postsData: Record<string, IPostDocument> = {};
          
          for (const postId of postIds) {
            const postRes = await fetch(`/api/posts/${postId}`);
            if (postRes.ok) {
              const postData = await postRes.json();
              if (postData.post) {
                postsData[postId] = postData.post;
              }
            }
          }
          
          setJobPosts(postsData);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [employerId]);
  
  // Filter applications based on tab
  const filteredApplications = applications.filter(application => {
    if (activeTab === "all") return true;
    return application.status === activeTab;
  });
  
  // Update application status
  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/job-applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        // Update local state
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading applications...</span>
      </div>
    );
  }
  
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-accent/5">
        <h3 className="text-xl font-medium mb-2">No applications yet</h3>
        <p className="text-muted-foreground">
          You have not received any applications for your job listings yet.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({applications.filter(a => a.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="reviewing">
            Reviewing ({applications.filter(a => a.status === 'reviewing').length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({applications.filter(a => a.status === 'accepted').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {filteredApplications.map(application => {
            const jobPost = jobPosts[application.postId];
            
            return (
              <div key={application._id} className="border rounded-lg p-6 bg-card">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 avatar-linkedin">
                      <AvatarImage src={application.applicant.userImage} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {application.applicant.firstName?.charAt(0)}
                        {application.applicant.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-lg">
                        {application.applicant.firstName} {application.applicant.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Applied <ReactTimeago date={new Date(application.createdAt)} />
                      </p>
                      
                      <div className="mt-2">
                        <StatusBadge status={application.status} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {application.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                          onClick={() => updateStatus(application._id, 'reviewing')}
                        >
                          Start Review
                        </Button>
                      </>
                    )}
                    
                    {(application.status === 'pending' || application.status === 'reviewing') && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-green-500 text-green-500 hover:bg-green-500/10"
                          onClick={() => updateStatus(application._id, 'accepted')}
                        >
                          Accept
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive/10"
                          onClick={() => updateStatus(application._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {jobPost && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Applied for:</h4>
                    <Link href={`/?postId=${jobPost._id}`} className="text-primary hover:underline font-medium">
                      Job posted on {new Date(jobPost.createdAt).toLocaleDateString()}
                    </Link>
                    <p className="mt-1 text-sm line-clamp-2">{jobPost.text}</p>
                  </div>
                )}
                
                {application.coverLetter && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Cover Letter:</h4>
                    <p className="text-sm whitespace-pre-line bg-accent/10 p-3 rounded-md">
                      {application.coverLetter}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}