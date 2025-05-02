"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/app/components/ui/command";
import {
  mainNavLinks,
  resourceLinks,
  NavigationLink,
} from "@/src/app/data/navigation";

export function SearchDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Combine all searchable items - can be extended with more content in the future
  const allLinks = [...mainNavLinks, ...resourceLinks];

  // Filter links based on search input
  const filteredLinks = allLinks.filter((link) => {
    return link.name.toLowerCase().includes(search.toLowerCase());
  });

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  // Handle item selection
  const handleSelect = (link: NavigationLink) => {
    setOpen(false);
    if (link.isExternal) {
      window.open(link.url, "_blank");
    } else {
      router.push(link.url);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search pages..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {filteredLinks.map((link) => (
            <CommandItem key={link.url} onSelect={() => handleSelect(link)}>
              {link.name}
              {link.isExternal && " (external)"}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
