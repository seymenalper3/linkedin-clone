"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  GraduationCap, 
  MapPin, 
  Briefcase,
  Link as LinkIcon,
  Phone,
  Calendar,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useRouter } from "next/navigation";
import PostFeed from "../PostFeed";
import Link from "next/link";

interface PublicProfileProps {
  profile: any;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
  isOwnProfile: boolean;
  posts: any[];
}

export default function PublicProfile({
  profile,
  user,
  isOwnProfile,
  posts
}: PublicProfileProps) {
  const router = useRouter();
  
  function formatDate(date: string | Date | undefined): string {
    if (!date) return "";
    return format(new Date(date), "MMM yyyy");
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-card rounded-lg border shadow-sm mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="h-28 w-28">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                {profile.headline && (
                  <p className="text-muted-foreground">{profile.headline}</p>
                )}
              </div>
              
              {isOwnProfile && (
                <Button 
                  onClick={() => router.push('/profile/edit')} 
                  variant="outline"
                  className="flex items-center gap-1.5"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              {profile.location && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              {isOwnProfile && profile.phoneNumber && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar with profile info */}
        <div className="md:col-span-1 space-y-6">
          {/* About section */}
          {profile.about && (
            <div className="bg-card rounded-lg border shadow-sm p-5">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <p className="text-sm whitespace-pre-line">{profile.about}</p>
            </div>
          )}
          
          {/* Experience section */}
          {profile.experience && profile.experience.length > 0 && (
            <div className="bg-card rounded-lg border shadow-sm p-5">
              <h2 className="text-lg font-semibold mb-4">Experience</h2>
              <div className="space-y-4">
                {profile.experience.map((exp: any) => (
                  <div key={exp._id} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{exp.title}</h3>
                      <p className="text-sm">{exp.company}</p>
                      {exp.location && (
                        <p className="text-xs text-muted-foreground">{exp.location}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(exp.startDate)} - {exp.isCurrentPosition ? "Present" : formatDate(exp.endDate)}
                      </p>
                      {exp.description && (
                        <p className="text-sm mt-2">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education section */}
          {profile.education && profile.education.length > 0 && (
            <div className="bg-card rounded-lg border shadow-sm p-5">
              <h2 className="text-lg font-semibold mb-4">Education</h2>
              <div className="space-y-4">
                {profile.education.map((edu: any) => (
                  <div key={edu._id} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{edu.school}</h3>
                      
                      {edu.degree && edu.fieldOfStudy && (
                        <p className="text-sm">{edu.degree} in {edu.fieldOfStudy}</p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {edu.startYear} - {edu.isCurrentlyStudying ? "Present" : edu.endYear}
                      </p>
                      
                      {edu.description && (
                        <p className="text-sm mt-2">{edu.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Skills section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-card rounded-lg border shadow-sm p-5">
              <h2 className="text-lg font-semibold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: any) => (
                  <Badge key={skill._id} variant="outline" className="bg-accent/30">
                    {skill.name}
                    {skill.endorsements > 0 && ` · ${skill.endorsements}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right content area with posts */}
        <div className="md:col-span-2">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              {posts && posts.length > 0 ? (
                <PostFeed 
                  initialPosts={posts}
                  emptyMessage={`${user.firstName} hasn&apos;t posted anything yet`}
                />
              ) : (
                <div className="bg-card border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">
                    {user.firstName} hasn&apos;t posted anything yet
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="articles">
              <div className="bg-card border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No articles yet</p>
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="bg-card border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}