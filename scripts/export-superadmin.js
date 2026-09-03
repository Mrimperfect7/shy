"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var EXPORT_DIR = path.join(process.cwd(), "superadmin-client-package");
var ZIP_NAME = "SuperadminCLI.zip";
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var pkgJson, envContent, readmeContent;
        return __generator(this, function (_a) {
            console.log("Packaging Superadmin CLI for client...");
            // 1. Create clean export directory
            if (fs.existsSync(EXPORT_DIR)) {
                fs.rmSync(EXPORT_DIR, { recursive: true, force: true });
            }
            fs.mkdirSync(EXPORT_DIR);
            fs.mkdirSync(path.join(EXPORT_DIR, "prisma"));
            pkgJson = {
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
            fs.writeFileSync(path.join(EXPORT_DIR, "package.json"), JSON.stringify(pkgJson, null, 2));
            // 3. Copy Prisma Schema
            fs.copyFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), path.join(EXPORT_DIR, "prisma", "schema.prisma"));
            // 4. Copy the CLI script
            fs.copyFileSync(path.join(process.cwd(), "scripts", "superadmin-cli.ts"), path.join(EXPORT_DIR, "cli.ts"));
            envContent = "# Ask the developer for the secure DATABASE_URL\nDATABASE_URL=\"postgresql://user:password@host:port/postgres\"\n";
            fs.writeFileSync(path.join(EXPORT_DIR, ".env"), envContent);
            readmeContent = "# Eshara Superadmin CLI\n\nThis is a secure, standalone terminal application to manage Admins on the Eshara platform.\n\n## Setup Instructions\n1. You must have [Node.js](https://nodejs.org/) installed on your computer.\n2. Open your terminal (Command Prompt or Mac Terminal) in this folder.\n3. Run this command to install dependencies:\n   `npm install`\n4. Open the `.env` file in this folder and replace the `DATABASE_URL` with the live secure URL provided by your developer.\n\n## Running the Dashboard\nTo start the Superadmin dashboard, simply run:\n`npm start`\n\nYou will be prompted securely for your Superadmin email and password.\n";
            fs.writeFileSync(path.join(EXPORT_DIR, "README.md"), readmeContent);
            // 7. Zip the directory (using PowerShell if on Windows, or zip on Mac/Linux)
            console.log("Skipping automated zip due to environment constraints.");
            console.log("\u2705 Success! The package has been saved to the folder: ".concat(EXPORT_DIR));
            console.log("You can zip this folder manually and email it to your client.");
            return [2 /*return*/];
        });
    });
}
main();
