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

// Ensure the directory exists
if (!fs.existsSync(ytDlpDir)) {
  fs.mkdirSync(ytDlpDir, { recursive: true });
  console.log("Created yt-dlp directory");
}

// Function to check if Python3 is available
function isPython3Available() {
  try {
    if (isWindows) {
      // 'where' command might find python.exe even if python3 isn't specifically linked
      // A more robust check might involve running 'python --version' or 'python3 --version'
      execSync("where python3", { stdio: "ignore" });
    } else {
      execSync("which python3", { stdio: "ignore" });
    }
    console.log("Python3 seems to be available.");
    return true;
  } catch (e) {
    console.log("Python3 does not seem to be available.");
    return false;
  }
}

// Function to download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirects
          downloadFile(response.headers.location, dest)
            .then(resolve)
            .catch(reject);
          return;
        }
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download file: ${response.statusCode} ${response.statusMessage}`
            )
          );
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {}); // Delete the file async
        reject(err);
      });
  });
}

// Function to set execute permissions
function setExecutePermission(filePath) {
  try {
    fs.chmodSync(filePath, 0o755);
    console.log(`Set execute permission for ${filePath}`);
  } catch (e) {
    console.error(`Error setting execute permission for ${filePath}:`, e);
  }
}

async function setupYtDlp() {
  console.log(`Platform detected: ${platform}`);

  const pythonAvailable = isPython3Available();

  if (isLinux && !pythonAvailable) {
    console.log(
      "Python3 not found on Linux. Attempting to download static yt-dlp binary..."
    );
    try {
      // Check if the target file already exists
      if (fs.existsSync(ytDlpPath)) {
        console.log(
          `Static binary target path ${ytDlpPath} already exists. Assuming it's the correct static binary.`
        );
        setExecutePermission(ytDlpPath);
      } else {
        await downloadFile(YTDLP_LINUX_STATIC_URL, ytDlpPath);
        console.log(`Downloaded static yt-dlp binary to ${ytDlpPath}`);
        setExecutePermission(ytDlpPath);
      }
      // Set environment variables just in case
      process.env.NO_PYTHON = "1";
      process.env.YT_DLP_NO_PYTHON = "1";
      console.log("Environment variables set to disable Python dependency");
    } catch (downloadError) {
      console.error("Failed to download static yt-dlp binary:", downloadError);
      console.error(
        "Proceeding with potentially Python-dependent binary (if it exists)."
      );
      // Fallback: ensure existing binary (if any) is executable
      if (fs.existsSync(ytDlpPath)) {
        setExecutePermission(ytDlpPath);
      }
    }
  } else if (isLinux && fs.existsSync(ytDlpPath)) {
    // Python is available OR binary already exists, just ensure permissions
    console.log("Ensuring existing Linux yt-dlp binary is executable...");
    setExecutePermission(ytDlpPath);
  } else if (isWindows) {
    console.log(
      "Windows platform detected. Assuming yt-dlp.exe exists and does not need permission changes."
    );
  }

  // Install optional dependencies needed for Linux deployment
  if (isLinux) {
    try {
      console.log("Installing optional platform-specific dependencies...");
      execSync(
        "npm install --no-save @tailwindcss/oxide-linux-x64-gnu@^4.1.5 lightningcss-linux-x64-gnu@^1.29.1 @img/sharp-linux-x64@^0.34.1",
        {
          stdio: "inherit",
        }
      );
      console.log("Platform-specific dependencies installed successfully");
    } catch (e) {
      console.error("Error installing platform-specific dependencies:", e);
      console.warn(
        "Continuing build despite optional dependency installation failure."
      );
    }
  }

  console.log("yt-dlp setup script finished.");
}

setupYtDlp().catch((err) => {
  console.error("Error during yt-dlp setup:", err);
  process.exit(1); // Exit with error code if setup fails
});
