import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "readline";
import { Writable } from "stream";

const prisma = new PrismaClient();

// Utility for hidden password input
function questionHidden(query: string, rl: readline.Interface): Promise<string> {
  return new Promise((resolve) => {
    let password = "";
    
    // We override the stdout stream to prevent printing keystrokes
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    
    process.stdout.write(query);

    const onData = (char: string) => {
      char = char + "";
      
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          // Enter or EOT
          stdin.removeListener("data", onData);
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write("\n");
          resolve(password);
          break;
        case "\u0003":
          // Ctrl+C
          stdin.removeListener("data", onData);
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write("\n");
          process.exit();
          break;
        case "\u0008":
        case "\x7f":
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            // Optional: visual backspace
            // process.stdout.write("\b \b");
          }
          break;
        default:
          password += char;
          // process.stdout.write("*"); // Optional visual masking
          break;
      }
    };

    stdin.on("data", onData);
  });
}

function ask(query: string, rl: readline.Interface): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function listAdmins() {
  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  console.log("\n--- Admin Users ---");
  users.forEach((u) => {
    console.log(
      `[${u.isActive ? "ACTIVE" : "SUSPENDED"}] ${u.name} (${u.email}) - ${u.role}`
    );
  });
  console.log("-------------------\n");
}

async function addAdmin(rl: readline.Interface) {
  const name = await ask("Name: ", rl);
  const email = await ask("Email: ", rl);
  const password = await questionHidden("Password: ", rl);
  
  if (!name || !email || !password) {
    console.log("❌ All fields are required.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("❌ User with this email already exists.");
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: hash,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`✅ Admin ${email} created successfully!\n`);
}

async function toggleAdminStatus(rl: readline.Interface) {
  const email = await ask("Enter Admin Email to toggle status: ", rl);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    console.log("❌ Admin not found.");
    return;
  }

  await prisma.user.update({
    where: { email: user.email },
    data: { isActive: !user.isActive },
  });
  console.log(`✅ Admin ${user.email} is now ${!user.isActive ? "ACTIVE" : "SUSPENDED"}.\n`);
}

async function deleteAdmin(rl: readline.Interface) {
  const email = await ask("Enter Admin Email to permanently delete: ", rl);
  const confirm = await ask(`Are you sure you want to delete ${email}? (y/N): `, rl);
  
  if (confirm.toLowerCase() !== "y") {
    console.log("Canceled.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    console.log("❌ Admin not found.");
    return;
  }

  if (user.role === "SUPERADMIN") {
    console.log("❌ Cannot delete a SUPERADMIN via this command.");
    return;
  }

  await prisma.user.delete({ where: { email: user.email } });
  console.log(`✅ Admin ${user.email} deleted permanently.\n`);
}

async function viewActivityLogs() {
  const logs = await prisma.adminActivity.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  console.log("\n--- Admin Activity Logs (Latest 50) ---");
  if (logs.length === 0) {
    console.log("No activity logs found.");
  }
  logs.forEach((log) => {
    const time = log.createdAt.toLocaleString();
    console.log(`[${time}] ${log.actionType} by ${log.adminEmail}`);
    if (log.details) {
      console.log(`  └─ ${log.details}`);
    }
  });
  console.log("---------------------------------------\n");
}

async function showMenu(rl: readline.Interface) {
  while (true) {
    console.log("\n--- SUPERADMIN MENU ---");
    console.log("1. List all Admins");
    console.log("2. Add new Admin");
    console.log("3. Suspend/Activate Admin");
    console.log("4. Delete Admin");
    console.log("5. View Admin Activity Logs");
    console.log("6. Exit");
    
    const choice = await ask("Select an option (1-6): ", rl);
    
    switch (choice.trim()) {
      case "1": await listAdmins(); break;
      case "2": await addAdmin(rl); break;
      case "3": await toggleAdminStatus(rl); break;
      case "4": await deleteAdmin(rl); break;
      case "5": await viewActivityLogs(); break;
      case "6": 
        console.log("Goodbye!");
        return;
      default:
        console.log("Invalid option.");
    }
  }
}

async function main() {
  console.log("===============================");
  console.log("  SUPERADMIN CLI DASHBOARD");
  console.log("===============================\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const email = await ask("Superadmin Email: ", rl);
  const password = await questionHidden("Password: ", rl);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || user.role !== "SUPERADMIN") {
    console.log("❌ Authentication failed. You are not a Superadmin.");
    process.exit(1);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    console.log("❌ Authentication failed. Incorrect password.");
    process.exit(1);
  }

  console.log(`\n✅ Welcome, ${user.name}!\n`);

  await showMenu(rl);

  rl.close();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
