const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");
const { execSync } = require("child_process");

// --- Configuration ---
const YTDLP_LINUX_STATIC_URL =
  "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";
// ---------------------

// Detect platform
const platform = os.platform();
const isWindows = platform === "win32";
const isLinux = platform === "linux";

// Define paths
const rootDir = process.cwd();
const ytDlpDir = path.join(rootDir, "yt-dlp");
const ytDlpFilename = isWindows ? "yt-dlp.exe" : "yt-dlp";
const ytDlpPath = path.join(ytDlpDir, ytDlpFilename);

console.log(
  `[setup-yt-dlp] Script started. Platform: ${platform}, CWD: ${rootDir}`
);
console.log(`[setup-yt-dlp] Target directory: ${ytDlpDir}`);
console.log(`[setup-yt-dlp] Target binary path: ${ytDlpPath}`);

// Ensure the directory exists
if (!fs.existsSync(ytDlpDir)) {
  try {
    fs.mkdirSync(ytDlpDir, { recursive: true });
    console.log(`[setup-yt-dlp] Created directory: ${ytDlpDir}`);
  } catch (mkdirErr) {
    console.error(
      `[setup-yt-dlp] Failed to create directory ${ytDlpDir}:`,
      mkdirErr
    );
    process.exit(1); // Exit if we can't create the dir
  }
} else {
  console.log(`[setup-yt-dlp] Directory ${ytDlpDir} already exists.`);
}

// Function to check if Python3 is available
function isPython3Available() {
  console.log("[setup-yt-dlp] Checking for Python3...");
  try {
    let command = isWindows ? "where python3" : "which python3";
    execSync(command, { stdio: "pipe" }); // Use pipe to capture output/error if needed, suppress logging
    console.log(`[setup-yt-dlp] Python3 found via '${command}'.`);
    return true;
  } catch (e) {
    console.log(
      `[setup-yt-dlp] Python3 check failed (Command: '${isWindows ? "where python3" : "which python3"}'). Assuming not available.`
    );
    // console.error("[setup-yt-dlp] Python3 check error details:", e); // Optional: uncomment for more detail
    return false;
  }
}

// Function to download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`[setup-yt-dlp] Attempting to download ${url} to ${dest}`);
    const file = fs.createWriteStream(dest);
    const request = https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          console.log(
            `[setup-yt-dlp] Redirect detected. Following redirect to ${response.headers.location}`
          );
          // Ensure the file stream is closed before retrying
          file.close(() => {
            downloadFile(response.headers.location, dest)
              .then(resolve)
              .catch(reject);
          });
          return;
        }
        if (response.statusCode !== 200) {
          console.error(
            `[setup-yt-dlp] Download failed! Status: ${response.statusCode} ${response.statusMessage}`
          );
          file.close();
          fs.unlink(dest, () => {}); // Clean up partially downloaded file
          reject(
            new Error(
              `Failed to download file: ${response.statusCode} ${response.statusMessage}`
            )
          );
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close((err) => {
            if (err) {
              console.error(
                `[setup-yt-dlp] Error closing file stream for ${dest}:`,
                err
              );
              reject(err);
            } else {
              console.log(
                `[setup-yt-dlp] File downloaded successfully to ${dest}`
              );
              resolve();
            }
          });
        });
      })
      .on("error", (err) => {
        console.error(`[setup-yt-dlp] Download request error for ${url}:`, err);
        fs.unlink(dest, () => {}); // Clean up
        reject(err);
      });
    // Handle request timeout (e.g., 30 seconds)
    request.setTimeout(30000, () => {
      console.error("[setup-yt-dlp] Download request timed out.");
      request.destroy(); // Destroy the request to prevent further processing
      fs.unlink(dest, () => {}); // Clean up
      reject(new Error("Download request timed out"));
    });
  });
}

// Function to set execute permissions
function setExecutePermission(filePath) {
  if (!isLinux) {
    console.log(
      `[setup-yt-dlp] Skipping chmod on non-Linux platform for ${filePath}`
    );
    return;
  }
  try {
    console.log(
      `[setup-yt-dlp] Attempting to set execute permission (chmod 755) for ${filePath}`
    );
    fs.chmodSync(filePath, 0o755);
    console.log(
      `[setup-yt-dlp] Successfully set execute permission for ${filePath}`
    );
  } catch (e) {
    console.error(
      `[setup-yt-dlp] Error setting execute permission for ${filePath}:`,
      e
    );
  }
}

async function setupYtDlp() {
  console.log(`[setup-yt-dlp] Starting setup process...`);

  const pythonAvailable = isPython3Available();
  let binaryExists = fs.existsSync(ytDlpPath);
  console.log(
    `[setup-yt-dlp] Initial check: Binary exists at ${ytDlpPath}? ${binaryExists}`
  );

  if (isLinux) {
    if (!pythonAvailable) {
      console.log(
        "[setup-yt-dlp] Condition met: Linux platform and Python3 not found."
      );
      if (!binaryExists) {
        console.log(
          `[setup-yt-dlp] Binary not found at ${ytDlpPath}. Attempting download...`
        );
        try {
          await downloadFile(YTDLP_LINUX_STATIC_URL, ytDlpPath);
          binaryExists = fs.existsSync(ytDlpPath);
          console.log(
            `[setup-yt-dlp] Post-download check: Binary exists at ${ytDlpPath}? ${binaryExists}`
          );
          if (binaryExists) {
            setExecutePermission(ytDlpPath);
          } else {
            console.error(
              "[setup-yt-dlp] CRITICAL: Binary still does not exist after download attempt!"
            );
          }
        } catch (downloadError) {
          console.error("[setup-yt-dlp] Download failed:", downloadError);
        }
      } else {
        console.log(
          `[setup-yt-dlp] Binary already exists at ${ytDlpPath}. Assuming it's the correct static version (or user-provided). Setting permissions.`
        );
        setExecutePermission(ytDlpPath);
      }
    } else {
      console.log(
        "[setup-yt-dlp] Condition met: Linux platform and Python3 IS available (or check failed)."
      );
      if (binaryExists) {
        console.log(
          `[setup-yt-dlp] Ensuring existing binary at ${ytDlpPath} has execute permission.`
        );
        setExecutePermission(ytDlpPath);
      } else {
        console.warn(
          `[setup-yt-dlp] WARNING: Python3 is available, but no yt-dlp binary found at ${ytDlpPath}. yt-dlp-wrap might fail.`
        );
      }
    }
    // Set environment variables regardless if Python isn't available, as a safeguard
    if (!pythonAvailable) {
      process.env.NO_PYTHON = "1";
      process.env.YT_DLP_NO_PYTHON = "1";
      console.log(
        "[setup-yt-dlp] Environment variables set to potentially disable Python dependency"
      );
    }
  } else if (isWindows) {
    console.log(
      `[setup-yt-dlp] Windows platform. Ensuring binary exists: ${binaryExists}. No permission changes needed.`
    );
    if (!binaryExists) {
      console.warn(
        `[setup-yt-dlp] WARNING: Windows platform, but no yt-dlp binary found at ${ytDlpPath}. yt-dlp-wrap will likely fail.`
      );
    }
  }

  // Install optional dependencies needed for Linux deployment
  if (isLinux) {
    try {
      console.log(
        "[setup-yt-dlp] Installing optional platform-specific dependencies (using --no-save)..."
      );
      execSync(
        "npm install --no-save @tailwindcss/oxide-linux-x64-gnu@^4.1.5 lightningcss-linux-x64-gnu@^1.29.1 @img/sharp-linux-x64@^0.34.1",
        { stdio: "inherit" }
      );
      console.log(
        "[setup-yt-dlp] Platform-specific dependencies installed successfully."
      );
    } catch (e) {
      console.error(
        "[setup-yt-dlp] Error installing platform-specific dependencies:",
        e
      );
      console.warn(
        "[setup-yt-dlp] Continuing build despite optional dependency installation failure."
      );
    }
  }

  console.log("[setup-yt-dlp] Setup script finished.");
}

setupYtDlp().catch((err) => {
  console.error("[setup-yt-dlp] Critical error during setup:", err);
  process.exit(1); // Exit with error code if setup fails
});
