"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Github, Search, Menu, X } from "lucide-react";
import { cn } from "@/src/app/lib/utils";
import { mainNavLinks, NavigationLink } from "../data/navigation";
import { WEBSITE_NAME } from "../lib/types";
import { SearchDialog } from "./SearchDialog";
import { Button } from "./ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
            {mainNavLinks.map((item: NavigationLink) => (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent/50",
                  pathname === item.url
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70"
                )}
              >
                <span>{item.name}</span>
              </Link>
            ))}
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
            {mainNavLinks.map((item: NavigationLink) => (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50",
                  pathname === item.url
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.name}</span>
              </Link>
            ))}
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
