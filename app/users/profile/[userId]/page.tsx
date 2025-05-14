import { redirect } from 'next/navigation';

export default function UserProfileRedirectPage({
  params,
}: {
  params: { userId: string };
}) {
  // Extract the user ID from the URL
  const { userId } = params;
  
  // Redirect to the canonical profile page
  redirect(`/profile/${userId}`);
}