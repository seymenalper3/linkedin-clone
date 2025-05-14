import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Briefcase,
  HomeIcon,
  MessagesSquare,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import NotificationIcon from "./NotificationIcon";
import EmployerLinks from "./EmployerLinks";

async function Header() {
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
      {/* SearchIcon */}
      <div className="flex-1">
        <form className="flex items-center space-x-2 bg-accent p-2.5 rounded-full flex-1 mx-3 max-w-96 border border-border">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent flex-1 outline-none text-sm"
          />
        </form>
      </div>

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
