"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <UserMenuLoader />;
  }

  if (!session) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn.social({ provider: "google" })}
        className="border-primary/20 bg-background text-primary hover:bg-primary/5 hover:text-primary h-14 w-14 rounded-full"
      >
        <User />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-12">
          <Avatar className="border-background h-12 w-12 border-2 shadow-sm">
            <AvatarImage
              src={session.user.image || ""}
              alt={session.user.name || "User"}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
          <div className="text-sm leading-none font-medium">
            {session.user.name}
          </div>
          <div className="text-muted-foreground text-xs">
            {session.user.email}
          </div>
        </DropdownMenuItem>
        <div className="bg-border my-1 h-px" />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenuLoader() {
  return <Skeleton className="h-14 w-14 rounded-full" />;
}
