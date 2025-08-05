"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Github, Search, Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { cn } from "@/src/app/lib/utils";
import { mainNavLinks, navigationCategories, NavigationLink } from "../data/navigation";
import { WEBSITE_NAME } from "../lib/types";
import { SearchDialog } from "./SearchDialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Successfully signed out");
        router.push("/");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">{WEBSITE_NAME}</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="h-9 w-9 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
          <SearchDialog open={searchOpen} setOpen={setSearchOpen} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Home Link */}
            <Link
              href="/"
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent/50",
                pathname === "/"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/70"
              )}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {/* Category Dropdowns */}
            {navigationCategories.map((category) => (
              <DropdownMenu key={category.name}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent/50",
                      category.items.some(item => pathname === item.url)
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/70"
                    )}
                  >
                    <span>{category.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {category.items.map((item) => (
                    <DropdownMenuItem key={item.url} asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-2",
                          pathname === item.url && "bg-accent"
                        )}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            {/* Auth Links */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex h-9 items-center gap-2 px-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block text-sm">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="btn-enhanced hover-lift">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="btn-enhanced hover-lift">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* GitHub Link */}
            <a
              href="https://github.com/WilsonRIP"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent/50 text-foreground/70"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden h-9 w-9 p-0"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-background border-b shadow-lg animate-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col space-y-3">
            {/* Home Link */}
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50",
                pathname === "/"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/70"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {/* Category Headers and Items */}
            {navigationCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category.name}
                </div>
                {category.items.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-6 py-2 text-sm font-medium transition-colors hover:bg-accent/50",
                      pathname === item.url
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/70"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            ))}

            {/* Auth Links */}
            {user ? (
              <div className="space-y-2 pt-2 border-t">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Account
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 rounded-md px-6 py-2 text-sm font-medium transition-colors hover:bg-accent/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 rounded-md px-6 py-2 text-sm font-medium transition-colors hover:bg-accent/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-md px-6 py-2 text-sm font-medium transition-colors hover:bg-accent/50 text-red-600 dark:text-red-400 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Account
                </div>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 rounded-md px-6 py-2 text-sm font-medium transition-colors hover:bg-accent/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-1.5 rounded-md px-6 py-2 text-sm font-medium transition-colors hover:bg-accent/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* GitHub Link */}
            <a
              href="https://github.com/WilsonRIP"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50 text-foreground/70"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
