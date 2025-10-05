import { BellIcon, HomeIcon, SearchCheckIcon, SearchIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ModeToggle } from "./mode-toggle";
import { hasUnreadNotifications } from "@/actions/notification.action";
import { cn } from "@/lib/utils";

async function DesktopNavbar() {
  const user = await currentUser();
  const hasUnread = user ? await hasUnreadNotifications() : false

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
          <Button variant="ghost" asChild className="relative group flex items-center gap-2">
            <Link href="/search" className="flex items-center gap-2">
              <SearchIcon
                className={cn(
                  "w-4 h-4 transition-colors duration-300",
                )}
              />
              <span className="hidden lg:flex items-center gap-1 transition-colors duration-300 ">
                Search
              </span>
            </Link>
          </Button>

      {user ? (
        <>
          <Button variant="ghost" asChild className="relative group flex items-center gap-2">
            <Link href="/notifications" className="flex items-center gap-2">
              <BellIcon
                className={cn(
                  "w-4 h-4 transition-colors duration-300",
                )}
              />
              <span className="hidden lg:flex items-center gap-1 transition-colors duration-300 ">
                Notifications
                {hasUnread && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </span>
            </Link>
          </Button>

                
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link
              href={`/profile/${user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
                }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;