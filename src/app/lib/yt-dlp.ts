import { spawn, exec } from "child_process";
import { platform } from "os";
import path from "path";
import fs from "fs";

/**
 * Get the correct path to yt-dlp executable based on the OS.
 * This needs to work in both local development and Vercel's runtime.
 */
export function getYtDlpPath(): string {
  const isWindows = platform() === "win32";
  const rootDir = process.cwd(); // Keep for local Windows dev

  if (isWindows) {
    // For local Windows development, assume it's in the project root's yt-dlp folder
    const winPath = path.join(rootDir, "yt-dlp", "yt-dlp.exe");
    // Add a check if it exists, maybe fallback? For now, assume it's there.
    return winPath;
  } else {
    // For Linux/Vercel:
    // __dirname points to the directory of the current module (.next/server/app/lib/ in build)
    // We assume the 'yt-dlp' directory is copied to the root of the deployment (/var/task/)
    // So, we need to go up from .next/server/app/lib/ to the root.
    // path.resolve calculates the absolute path correctly.
    // Adjust the number of '../' based on the actual build output structure if needed.
    const linuxPath = path.resolve(__dirname, "../../../../yt-dlp/yt-dlp");

    // Optional: Add a check and fallback or logging if needed
    // if (!fs.existsSync(linuxPath)) {
    //   console.warn(`[getYtDlpPath] Expected binary not found at: ${linuxPath}`);
    //   // Potentially fallback to a globally installed path or throw an error
    // }
    return linuxPath;
  }
}

/**
 * Check if python3 is available in the system
 */
async function isPython3Available(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("which python3", (error) => {
      resolve(!error);
    });
  });
}

/**
 * Run a yt-dlp command with the provided arguments
 */
export function runYtDlp(args: string[]): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const ytDlpPath = getYtDlpPath();

    // Set environment variables to make yt-dlp not rely on Python
    const env = {
      ...process.env,
      NO_PYTHON: "1", // Some yt-dlp versions check this
      YT_DLP_NO_PYTHON: "1", // Custom env var that might be checked
    };

    const ytDlpProc = spawn(ytDlpPath, args, { env });

    let stdout = "";
    let stderr = "";

    ytDlpProc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    ytDlpProc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ytDlpProc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else if (
        stderr.includes("python3") &&
        stderr.includes("No such file or directory")
      ) {
        // Handle the specific Python error by logging it and providing a more helpful message
        console.error("Python3 dependency error detected with yt-dlp");
        reject(
          new Error(
            "yt-dlp requires Python3 which is not available in this environment"
          )
        );
      } else {
        reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
      }
    });

    ytDlpProc.on("error", (err) => {
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
    });
  });
}
