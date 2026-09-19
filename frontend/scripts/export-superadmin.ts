import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const EXPORT_DIR = path.join(process.cwd(), "superadmin-client-package");
const ZIP_NAME = "SuperadminCLI.zip";

async function main() {
  console.log("Packaging Superadmin CLI for client...");

  // 1. Create clean export directory
  if (fs.existsSync(EXPORT_DIR)) {
    fs.rmSync(EXPORT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(EXPORT_DIR);
  fs.mkdirSync(path.join(EXPORT_DIR, "prisma"));

  // 2. Create minimal package.json
  const pkgJson = {
    name: "eshara-superadmin-cli",
    version: "1.0.0",
    description: "Secure terminal interface for managing Eshara Admins",
    main: "cli.ts",
    scripts: {
      "postinstall": "prisma generate",
      "start": "npx tsx cli.ts"
    },
    dependencies: {
      "@prisma/client": "^6.19.3",
      "bcryptjs": "^3.0.3",
      "prisma": "^6.19.3",
      "tsx": "^4.7.1"
    },
    devDependencies: {
      "@types/bcryptjs": "^2.4.6",
      "@types/node": "^20.0.0",
      "typescript": "^5.0.0"
    }
  };
  fs.writeFileSync(
    path.join(EXPORT_DIR, "package.json"),
    JSON.stringify(pkgJson, null, 2)
  );

  // 3. Copy Prisma Schema
  fs.copyFileSync(
    path.join(process.cwd(), "prisma", "schema.prisma"),
    path.join(EXPORT_DIR, "prisma", "schema.prisma")
  );

  // 4. Copy the CLI script
  fs.copyFileSync(
    path.join(process.cwd(), "scripts", "superadmin-cli.ts"),
    path.join(EXPORT_DIR, "cli.ts")
  );

  // 5. Create .env.example
  const envContent = `# Ask the developer for the secure DATABASE_URL
DATABASE_URL="postgresql://user:password@host:port/postgres"
`;
  fs.writeFileSync(path.join(EXPORT_DIR, ".env"), envContent);

  // 6. Create README instructions for the client
  const readmeContent = `# Eshara Superadmin CLI

This is a secure, standalone terminal application to manage Admins on the Eshara platform.

## Setup Instructions
1. You must have [Node.js](https://nodejs.org/) installed on your computer.
2. Open your terminal (Command Prompt or Mac Terminal) in this folder.
3. Run this command to install dependencies:
   \`npm install\`
4. Open the \`.env\` file in this folder and replace the \`DATABASE_URL\` with the live secure URL provided by your developer.

## Running the Dashboard
To start the Superadmin dashboard, simply run:
\`npm start\`

You will be prompted securely for your Superadmin email and password.
`;
  fs.writeFileSync(path.join(EXPORT_DIR, "README.md"), readmeContent);

  // 7. Zip the directory (using PowerShell if on Windows, or zip on Mac/Linux)
  console.log("Skipping automated zip due to environment constraints.");
  console.log(`✅ Success! The package has been saved to the folder: ${EXPORT_DIR}`);
  console.log("You can zip this folder manually and email it to your client.");
}

main();
