"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Menu, X, Search, Github, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WEBSITE_NAME } from "../lib/types";
// import { useBetterAuth } from "@/src/contexts/BetterAuthContext";
import { Button } from "./ui/button";
import { SearchDialog } from "./SearchDialog";
import ThemeToggle from "./ThemeToggle";
import {
  AnimatedNavLink,
  NavMenu,
  UserNav,
  MobileNav,
} from "./NavbarElements";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const { signOut } = useBetterAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // const { error } = await signOut();
      // if (error) throw error;
      toast.success("Successfully signed out!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred during sign out.");
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Section: Logo & Main Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              {/* Optional: Add an icon or logo here */}
              <span className="font-bold text-lg">{WEBSITE_NAME}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <AnimatedNavLink href="/">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </AnimatedNavLink>
              <NavMenu />
            </nav>
          </div>

          {/* Right Section: Search, Theme Toggle, Auth, and Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            <a
              href="https://github.com/WilsonRIP"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <Button variant="ghost" size="icon" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </Button>
            </a>
            
            <UserNav handleSignOutAction={handleSignOut} />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={mobileMenuOpen ? "x" : "menu"}
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <MobileNav 
            isOpen={mobileMenuOpen} 
            closeMenuAction={closeMobileMenu} 
            handleSignOutAction={handleSignOut}
        />
      </header>
      <SearchDialog open={searchOpen} setOpenAction={setSearchOpen} />
    </>
  );
}