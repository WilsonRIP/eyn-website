import { spawn } from "child_process";
import { platform } from "os";
import path from "path";

/**
 * Get the correct path to yt-dlp executable based on the OS
 */
export function getYtDlpPath(): string {
  const isWindows = platform() === "win32";
  const rootDir = process.cwd();

  if (isWindows) {
    return path.join(rootDir, "yt-dlp", "yt-dlp.exe");
  } else {
    return path.join(rootDir, "yt-dlp", "yt-dlp");
  }
}

/**
 * Run a yt-dlp command with the provided arguments
 */
export function runYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath();
    const process = spawn(ytDlpPath, args);

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
      }
    });

    process.on("error", (err) => {
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
    });
  });
}
