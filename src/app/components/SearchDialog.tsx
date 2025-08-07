"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
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

interface SearchableItem extends NavigationLink {
  type: "page" | "resource";
}

export function SearchDialog({
  open,
  setOpenAction,
}: {
  open: boolean;
  setOpenAction: (open: boolean) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  // Combine all searchable items with type information
  const allSearchableItems = useMemo<SearchableItem[]>(() => {
    return [
      ...mainNavLinks.map((link) => ({ ...link, type: "page" as const })),
      ...resourceLinks.map((link) => ({ ...link, type: "resource" as const })),
    ];
  }, []);

  // Filter links based on search input with fuzzy matching
  const filteredItems = useMemo(() => {
    if (!search.trim()) return allSearchableItems;

    const searchLower = search.toLowerCase();
    
    return allSearchableItems.filter((item) => {
      // Basic fuzzy matching - checks if all characters in search appear in
      // order in the item name
      let searchIndex = 0;
      const itemNameLower = item.name.toLowerCase();
      
      for (let i = 0; i < itemNameLower.length && searchIndex < searchLower.length; i++) {
        if (itemNameLower[i] === searchLower[searchIndex]) {
          searchIndex++;
        }
      }
      
      return searchIndex === searchLower.length;
    });
  }, [search, allSearchableItems]);

  // Group items by type for better organization
  const groupedItems = useMemo(() => {
    const pages = filteredItems.filter((item) => item.type === "page");
    const resources = filteredItems.filter((item) => item.type === "resource");
    
    return { pages, resources };
  }, [filteredItems]);

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpenAction(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpenAction]);

  // Handle item selection with error handling
  const handleSelect = useCallback(async (item: SearchableItem) => {
    setOpenAction(false);
    setSearch(""); // Reset search after selection
    setIsNavigating(true);
    
    try {
      if (item.isExternal) {
        window.open(item.url, "_blank", "noopener,noreferrer");
      } else {
        await router.push(item.url);
      }
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsNavigating(false);
    }
  }, [setOpenAction, router]);

  // Highlight matching text in the item name
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="font-bold text-primary">
          {part}
        </span>
      ) : (
        part
      )
    );
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpenAction}>
      <CommandInput
        placeholder="Search pages and resources..."
        value={search}
        onValueChange={setSearch}
        aria-label="Search"
      />
      <CommandList>
        {isNavigating ? (
          <div className="py-6 text-center text-sm">Navigating...</div>
        ) : (
          <>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {groupedItems.pages.length > 0 && (
              <CommandGroup heading="Pages">
                {groupedItems.pages.map((item) => (
                  <CommandItem
                    key={`page-${item.url}`}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center justify-between"
                    aria-label={`Navigate to ${item.name}${
                      item.isExternal ? " (external link)" : ""
                    }`}
                  >
                    <div>{highlightMatch(item.name, search)}</div>
                    {item.isExternal && (
                      <span
                        className="text-xs text-muted-foreground"
                        aria-hidden="true"
                      >
                        (external)
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {groupedItems.resources.length > 0 && (
              <CommandGroup heading="Resources">
                {groupedItems.resources.map((item) => (
                  <CommandItem
                    key={`resource-${item.url}`}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center justify-between"
                    aria-label={`Navigate to ${item.name}${
                      item.isExternal ? " (external link)" : ""
                    }`}
                  >
                    <div>{highlightMatch(item.name, search)}</div>
                    {item.isExternal && (
                      <span
                        className="text-xs text-muted-foreground"
                        aria-hidden="true"
                      >
                        (external)
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}