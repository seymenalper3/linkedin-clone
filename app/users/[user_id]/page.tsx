import { redirect } from 'next/navigation';

interface UserPageProps {
  params: {
    user_id: string;
  };
}

// This page will redirect to the comprehensive profile page
export default function UserPage({ params }: UserPageProps) {
  // Extract the user_id from the URL
  const { user_id } = params;
  
  // Redirect to the comprehensive profile page
  redirect(`/profile/${user_id}`);
}