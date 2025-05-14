import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/mongodb/db';
import mongoose from 'mongoose';
import ApplicationsList from '@/components/ApplicationsList';

export default async function ApplicationsPage() {
  // Get current user
  const { userId } = auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect('/');
  }
  
  // Check if user is an employer
  await connectDB();
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    userId: String,
    role: String,
  }));
  
  const dbUser = await User.findOne({ userId });
  const userRole = dbUser?.role || 'employee';
  
  // If not an employer, redirect to home
  if (userRole !== 'employer') {
    redirect('/?error=employer_only');
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold my-6">Job Applications</h1>
      <p className="text-muted-foreground mb-8">
        View and manage applications for your job listings
      </p>
      
      <ApplicationsList employerId={userId} />
    </div>
  );
}