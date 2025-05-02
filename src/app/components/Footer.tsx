"use client";

import React from "react";
import Link from "next/link";
import { Github, Mail, Twitter } from "lucide-react";
import { footerLinkGroups } from "../data/navigation";
import { WEBSITE_NAME, EMAIL, NAME } from "../lib/types";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Logo and description */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">{WEBSITE_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Everything You Need - A collection of free online tools to help
              you with your daily tasks.
            </p>
            <div className="flex items-center gap-4">
              <a
                href={`https://github.com/WilsonRIP`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href={`https://twitter.com/wilsoniirip`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Link groups */}
          {footerLinkGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <h3 className="font-medium">{group.title}</h3>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.url}>
                    {link.isExternal ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.url}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} {NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
