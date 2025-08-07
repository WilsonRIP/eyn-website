"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/src/app/lib/utils";
import { navigationCategories, NavigationLink } from "../data/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Home,
  ChevronDown,
  MoreHorizontal,
  User,
  LogOut,
  Github,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { useBetterAuth } from "@/src/contexts/BetterAuthContext";
import ThemeToggle from "./ThemeToggle";

// Animated Nav Link for the sliding indicator effect
export function AnimatedNavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isActive ? "text-accent-foreground" : "text-foreground/70",
        className
      )}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="navbar-active-link"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
    </Link>
  );
}

// Refactored Nav Dropdown Menu
export function NavMenu() {
  const pathname = usePathname();
  // Determine which categories to show directly and which to put in "More" using CSS classes
  const visibleCategories = navigationCategories.slice(0, 6); // Show first 6 categories
  const overflowCategories = navigationCategories.slice(6);   // the rest

  const renderDropdown = (category: typeof navigationCategories[0]) => {
    const isCategoryActive = category.items.some(item => pathname === item.url);
    return (
      <DropdownMenu key={category.name}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "relative flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isCategoryActive ? "text-accent-foreground" : "text-foreground/70"
            )}
          >
            <span>{category.name}</span>
            <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            {isCategoryActive && (
                 <motion.span
                    layoutId="navbar-active-link" // Re-use layoutId for consistency
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {category.items.map((item) => (
            <DropdownMenuItem key={item.url} asChild>
              <Link
                href={item.url}
                className={cn(pathname === item.url && "font-semibold text-primary")}
              >
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
      {/* These will be hidden on smaller screens via className */}
      <div className="hidden lg:flex items-center gap-1">
        {visibleCategories.map(renderDropdown)}
      </div>

      {/* Renders fewer items on medium screens */}
      <div className="hidden md:flex lg:hidden items-center gap-1">
        {visibleCategories.slice(0, 4).map(renderDropdown)}
      </div>

      {/* "More" dropdown for overflow items */}
      <DropdownMenu>
        {/* The trigger is hidden unless there are overflow items */}
        <DropdownMenuTrigger asChild className="hidden md:flex">
             <Button
                variant="ghost"
                className="relative flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent/50 text-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="hidden xl:block">More</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
            {/* Combine remaining categories for different screen sizes */}
            <div className="lg:hidden">
                {visibleCategories.slice(4).map(cat => (
                    <React.Fragment key={cat.name}>
                        <DropdownMenuLabel>{cat.name}</DropdownMenuLabel>
                        {cat.items.map(item => <DropdownMenuItem key={item.url} asChild><Link href={item.url}>{item.name}</Link></DropdownMenuItem>)}
                    </React.Fragment>
                ))}
            </div>
            {overflowCategories.map((category) => (
                <React.Fragment key={category.name}>
                    <DropdownMenuLabel>{category.name}</DropdownMenuLabel>
                    {category.items.map((item) => (
                        <DropdownMenuItem key={item.url} asChild>
                            <Link href={item.url}>{item.name}</Link>
                        </DropdownMenuItem>
                    ))}
                </React.Fragment>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// User Auth section
export function UserNav({ handleSignOutAction }: { handleSignOutAction: () => void }) {
  // const { user } = useBetterAuth();
  const user: any = null; // Temporarily disable auth

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || undefined} alt="User Avatar" />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard"><User className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile"><User className="mr-2 h-4 w-4" /><span>Profile</span></Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOutAction} className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/auth/login">Sign In</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </div>
  );
}

// Mobile Navigation with staggered animations
export function MobileNav({ isOpen, closeMenuAction, handleSignOutAction }: { isOpen: boolean, closeMenuAction: () => void, handleSignOutAction: () => void }) {
    // const { user } = useBetterAuth();
    const user: any = null; // Temporarily disable auth
    const pathname = usePathname();

    const containerVariants: Variants = {
        open: {
            opacity: 1,
            height: 'auto',
            transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.05 }
        },
        closed: {
            opacity: 0,
            height: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        }
    };
    
    const itemVariants: Variants = {
        open: { opacity: 1, y: 0 },
        closed: { opacity: 0, y: -15 }
    };

    const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
        <motion.div variants={itemVariants}>
            <Link
                href={href}
                onClick={closeMenuAction}
                className={cn(
                    "flex items-center gap-3 rounded-md p-3 text-base font-medium transition-colors hover:bg-accent",
                    pathname === href ? "bg-accent" : "text-muted-foreground"
                )}
            >
                {children}
            </Link>
        </motion.div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={containerVariants}
                    className="md:hidden overflow-hidden border-b"
                >
                    <div className="flex flex-col space-y-2 p-4">
                        <MobileNavLink href="/"><Home className="h-5 w-5" /> Home</MobileNavLink>

                        {navigationCategories.map(category => (
                            <motion.div key={category.name} variants={itemVariants} className="space-y-1">
                                <h4 className="px-3 pt-2 text-sm font-semibold text-foreground">{category.name}</h4>
                                {category.items.map(item => (
                                    <Link 
                                        key={item.url} 
                                        href={item.url} 
                                        onClick={closeMenuAction}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md py-2 px-6 text-base font-medium transition-colors hover:bg-accent",
                                            pathname === item.url ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </motion.div>
                        ))}
                        
                        <motion.div variants={itemVariants}><div className="pt-2 border-t"></div></motion.div>

                        {user ? (
                           <>
                             <MobileNavLink href="/dashboard"><User className="h-5 w-5" /> Dashboard</MobileNavLink>
                             <MobileNavLink href="/profile"><User className="h-5 w-5" /> Profile</MobileNavLink>
                             <motion.div variants={itemVariants}>
                                 <button onClick={() => { handleSignOutAction(); closeMenuAction(); }} className="flex w-full items-center gap-3 rounded-md p-3 text-base font-medium transition-colors hover:bg-accent text-red-500">
                                     <LogOut className="h-5 w-5" /> Sign Out
                                 </button>
                             </motion.div>
                           </>
                        ) : (
                           <>
                              <MobileNavLink href="/auth/login"><User className="h-5 w-5" /> Sign In</MobileNavLink>
                              <MobileNavLink href="/auth/signup"><User className="h-5 w-5" /> Sign Up</MobileNavLink>
                           </>
                        )}

                        <MobileNavLink href="https://github.com/WilsonRIP"><Github className="h-5 w-5" /> GitHub</MobileNavLink>
                        
                        <motion.div variants={itemVariants} className="flex items-center justify-between px-3 py-2">
                            <span className="text-sm font-medium text-muted-foreground">Theme</span>
                            <ThemeToggle />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}