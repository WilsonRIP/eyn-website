import { auth } from "@/src/lib/auth";
import { handle } from "better-auth/next";

// Export the handler for all auth routes
export const { GET, POST } = handle(auth);
