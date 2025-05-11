import { auth, currentUser } from "@clerk/nextjs";
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

async function MessagesPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-800">
          Please sign in to view your messages
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 mt-5">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar - conversation list */}
        <div className="w-full md:w-1/3 border-r pr-4">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold text-lg">Conversations</h2>
            <Button variant="ghost" size="sm" className="text-blue-600">
              + New
            </Button>
          </div>
          
          <div className="space-y-1">
            <div className="p-3 bg-blue-50 rounded-md">
              <MessagePreview
                name="LinkedIn Team"
                message="Welcome to LinkedIn clone! This is a demo conversation."
                time="Just now"
                active={true}
              />
            </div>
            
            <MessagePreview
              name="Feature Preview"
              message="This messaging feature is coming soon. We're working on it!"
              time="5m ago"
            />
          </div>
        </div>
        
        {/* Right side - message content */}
        <div className="w-full md:w-2/3">
          <div className="border-b pb-3 mb-4">
            <h3 className="font-semibold">LinkedIn Team</h3>
          </div>
          
          <div className="space-y-4 mb-4">
            <MessageBubble
              sender="LinkedIn Team"
              message="👋 Welcome to the LinkedIn clone messaging feature!"
              time="9:30 AM"
              isFromUser={false}
            />
            
            <MessageBubble
              sender="LinkedIn Team"
              message="This is a demo of the messaging interface we're building."
              time="9:31 AM"
              isFromUser={false}
            />
            
            <MessageBubble
              sender={`${user.firstName} ${user.lastName}`}
              message="Thanks for the preview! Looking forward to the full feature."
              time="9:35 AM"
              isFromUser={true}
            />
          </div>
          
          <div className="flex gap-2 items-end">
            <textarea 
              className="w-full border rounded-md p-2 resize-none min-h-[80px]" 
              placeholder="Type a message..."
            />
            <Button className="bg-[#0B63C4]">Send</Button>
          </div>
          
          <div className="text-center mt-4 text-gray-500 text-sm">
            <p>💡 This is a preview of the messaging feature. The full functionality will be implemented soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessagePreviewProps {
  name: string;
  message: string;
  time: string;
  active?: boolean;
}

function MessagePreview({ name, message, time, active }: MessagePreviewProps) {
  return (
    <div className={`flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer ${active ? 'font-medium' : ''}`}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={`https://ui-avatars.com/api/?name=${name.replace(/\s/g, '+')}`} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between">
          <p className={`truncate ${active ? 'text-blue-700' : ''}`}>{name}</p>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{message}</p>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  sender: string;
  message: string;
  time: string;
  isFromUser: boolean;
}

function MessageBubble({ sender, message, time, isFromUser }: MessageBubbleProps) {
  return (
    <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isFromUser ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg p-3`}>
        {!isFromUser && <p className="text-xs font-medium mb-1">{sender}</p>}
        <p className="text-sm">{message}</p>
        <p className="text-right text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

export default MessagesPage;