import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const EXPORT_DIR = path.join(process.cwd(), "eshara-admin-dashboard");
const ZIP_NAME = "EsharaAdminDashboard.zip";

function copyDirectory(src: string, dest: string, exclude: string[]) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    if (exclude.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  console.log("Preparing Stripped Admin-Only Dashboard...");

  if (fs.existsSync(EXPORT_DIR)) {
    fs.rmSync(EXPORT_DIR, { recursive: true, force: true });
  }

  // 1. Copy the entire repository, ignoring heavy/unneeded folders
  const excludeRoots = [
    "node_modules", 
    ".git", 
    ".next", 
    "eshara-admin-dashboard", 
    "EsharaAdminDashboard.zip",
    "SuperadminCLI.zip"
  ];
  
  copyDirectory(process.cwd(), EXPORT_DIR, excludeRoots);

  // 2. Delete all customer-facing routes from the cloned app folder
  const appDir = path.join(EXPORT_DIR, "app");
  const customerRoutes = [
    "about", "account", "cart", "checkout", "collections", 
    "contact", "creator-collab", "influencer", "ingredients", 
    "journal", "privacy", "products", "ref", "refund-policy", 
    "shipping-policy", "shop", "terms"
  ];

  customerRoutes.forEach(route => {
    const routePath = path.join(appDir, route);
    if (fs.existsSync(routePath)) {
      fs.rmSync(routePath, { recursive: true, force: true });
    }
  });

  // 3. Replace the main page.tsx to redirect straight to the admin login
  const pageTsxPath = path.join(appDir, "page.tsx");
  const pageTsxContent = `"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}
`;
  fs.writeFileSync(pageTsxPath, pageTsxContent);

  // 4. Create README
  const readme = `# Eshara Admin Dashboard

This is the secure, isolated Admin Dashboard. 

## Setup
1. Run \`npm install\`
2. Set up your \`.env\` file with the database connection.
3. Run \`npm run dev\`
4. Go to \`http://localhost:3000/login\`
`;
  fs.writeFileSync(path.join(EXPORT_DIR, "README.md"), readme);

  console.log(`✅ Success! The stripped admin clone is ready in: ${EXPORT_DIR}`);
  console.log("You can now zip this folder and send it to your client!");
}

main();
