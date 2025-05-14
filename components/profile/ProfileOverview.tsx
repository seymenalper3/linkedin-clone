"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CalendarIcon, GraduationCap, MapPin, Briefcase, PencilIcon } from "lucide-react";
import { format } from "date-fns";

interface ProfileOverviewProps {
  profile: any;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
  onEditSection: (section: string) => void;
}

export default function ProfileOverview({
  profile,
  user,
  onEditSection,
}: ProfileOverviewProps) {
  function formatDate(date: string | Date | undefined): string {
    if (!date) return "";
    return format(new Date(date), "MMM yyyy");
  }

  return (
    <div className="space-y-8">
      {/* Header with avatar and basic info */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {user.firstName?.charAt(0)}
            {user.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              {profile.headline && (
                <p className="text-muted-foreground">{profile.headline}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEditSection("basic")}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            {profile.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.website && (
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* About section */}
      <div className="bg-accent/5 p-5 rounded-lg">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold">About</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEditSection("basic")}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2">
          {profile.about ? (
            <p className="whitespace-pre-line text-sm">{profile.about}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Add a summary about yourself
            </p>
          )}
        </div>
      </div>
      
      {/* Experience section */}
      <div className="bg-accent/5 p-5 rounded-lg">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold">Experience</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEditSection("experience")}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4 space-y-4">
          {profile.experience && profile.experience.length > 0 ? (
            profile.experience.map((exp: any) => (
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
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Add your work experience
            </p>
          )}
        </div>
      </div>
      
      {/* Education section */}
      <div className="bg-accent/5 p-5 rounded-lg">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold">Education</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEditSection("education")}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4 space-y-4">
          {profile.education && profile.education.length > 0 ? (
            profile.education.map((edu: any) => (
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
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Add your education history
            </p>
          )}
        </div>
      </div>
      
      {/* Skills section */}
      <div className="bg-accent/5 p-5 rounded-lg">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold">Skills</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEditSection("skills")}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4">
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: any) => (
                <Badge key={skill._id} variant="outline" className="bg-accent/30">
                  {skill.name}
                  {skill.endorsements > 0 && ` · ${skill.endorsements}`}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Add your skills to highlight your expertise
            </p>
          )}
        </div>
      </div>
    </div>
  );
}