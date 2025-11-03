"use client";

import { History, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Spinner } from "./ui/spinner";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSigningOutPending, startSigningOutTransition] = useTransition();

  const router = useRouter();

  const handleSignOut = () => {
    startSigningOutTransition(async () => {
      try {
        await signOut({
          fetchOptions: {
            onSuccess: () => {
              toast.success("Success", {
                description: "Successfully signed out. See you soon!",
              });
              setIsDialogOpen(false);
              router.push("/");
              router.refresh();
            },
          },
        });
      } catch (error: unknown) {
        const e = error as Error;
        console.error("Sign out error:", e.message);
        toast.error("Failure", {
          description: e.message || "Failed to sign out",
        });
        setIsDialogOpen(false);
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" title="YT-Get">
          <Image
            src="https://cvn39oor0x.ufs.sh/f/DcXFl3rOmNR3DkwoHsrOmNR31xhY9ZnitdBGMpe5ITJsgSly"
            alt="yt-get__logo"
            width={32}
            height={32}
            preload
          />
        </Link>

        <Link
          href="/history"
          className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
        >
          <History className="size-4" />
          History
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="">
                <Button
                  variant="ghost"
                  className="relative flex items-center rounded-full size-8"
                >
                  <Avatar className="size-8">
                    {user?.image ? (
                      <div className="relative aspect-square size-full">
                        <Image
                          src={user.image}
                          alt={user.name ?? ""}
                          className="rounded-full object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                        />
                      </div>
                    ) : (
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "Guest"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "No email"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center">
                    <User className="size-4" />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>

                <AlertDialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
                  <AlertDialogTrigger className="flex items-center gap-2 py-1 text-left text-sm hover:bg-sidebar-accent w-full">
                    <LogOut className="size-4 ml-2.5 text-accent-foreground/70" />
                    Sign out
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. It will sign you out of
                        your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isSigningOutPending}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSignOut();
                        }}
                      >
                        {isSigningOutPending ? (
                          <div className="flex items-center gap-2">
                            <Spinner />
                            Signing out...
                          </div>
                        ) : (
                          "Continue"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/sign-in">
                <span>Sign In</span>
              </Link>
            </Button>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
