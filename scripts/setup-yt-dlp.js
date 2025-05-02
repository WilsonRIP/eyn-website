const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");
const { execSync } = require("child_process");

// Detect platform
const platform = os.platform();
const isWindows = platform === "win32";
const isLinux = platform === "linux";

// Define paths
const rootDir = process.cwd();
const ytDlpDir = path.join(rootDir, "yt-dlp");
const ytDlpPath = path.join(ytDlpDir, isWindows ? "yt-dlp.exe" : "yt-dlp");

// Ensure the directory exists
if (!fs.existsSync(ytDlpDir)) {
  fs.mkdirSync(ytDlpDir, { recursive: true });
  console.log("Created yt-dlp directory");
}

// Set executable permission for Linux binary
if (isLinux && fs.existsSync(ytDlpPath)) {
  try {
    fs.chmodSync(ytDlpPath, 0o755);
    console.log("Made yt-dlp executable");
  } catch (e) {
    console.error("Error making yt-dlp executable:", e);
  }
}

// Function to check if Python3 is available
function isPython3Available() {
  try {
    if (isWindows) {
      execSync("where python3", { stdio: "ignore" });
    } else {
      execSync("which python3", { stdio: "ignore" });
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Make sure all optional dependencies are properly installed
try {
  if (isLinux) {
    console.log("Installing optional platform-specific dependencies...");
    execSync(
      "npm install @tailwindcss/oxide-linux-x64-gnu@^4.1.5 lightningcss-linux-x64-gnu@^1.29.1 @img/sharp-linux-x64@^0.34.1",
      {
        stdio: "inherit",
      }
    );
    console.log("Platform-specific dependencies installed successfully");
  }
} catch (e) {
  console.error("Error installing platform-specific dependencies:", e);
}

// Check if we need to handle the Python3 issue
if (isLinux && !isPython3Available()) {
  console.log("Python3 not found. Setting up static yt-dlp binary...");

  // Set NO_PYTHON environment variable for future use
  process.env.NO_PYTHON = "1";
  process.env.YT_DLP_NO_PYTHON = "1";

  console.log("Environment variables set to disable Python dependency");
}

console.log("yt-dlp setup completed");
