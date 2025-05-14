"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Briefcase,
  HomeIcon,
  MessagesSquare,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import NotificationIcon from "./NotificationIcon";
import EmployerLinks from "./EmployerLinks";
import SearchBar from "./SearchBar";

function Header() {
  return (
    <div className="flex items-center py-2.5 px-4 max-w-6xl mx-auto">
      {/* Logo */}
      <Image
        className="rounded-md mr-1"
        src="https://links.papareact.com/b3z"
        width={36}
        height={36}
        alt="logo"
      />

      {/* Search */}
      <SearchBar />

      <div className="flex items-center space-x-2">
        <Link href="/" className="icon px-3 py-1.5">
          <HomeIcon className="h-5 w-5" />
          <p>Home</p>
        </Link>

        <Link href="/network" className="icon px-3 py-1.5 hidden md:flex">
          <UsersIcon className="h-5 w-5" />
          <p>Network</p>
        </Link>

        <Link href="/users" className="icon px-3 py-1.5 hidden md:flex">
          <Briefcase className="h-5 w-5" />
          <p>Find People</p>
        </Link>

        <Link href="/messages" className="icon px-3 py-1.5">
          <MessagesSquare className="h-5 w-5" />
          <p>Messaging</p>
        </Link>

        <SignedIn>
          <div id="employer-links">
            <EmployerLinks />
          </div>
          <NotificationIcon />
          <div className="ml-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>

        <SignedOut>
          <Button asChild className="btn-linkedin ml-2">
            <SignInButton />
          </Button>
        </SignedOut>
      </div>
    </div>
  );
}

export default Header;
