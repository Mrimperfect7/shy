const fs = require('fs');
const bcrypt = require('bcryptjs');

let sql = fs.readFileSync('setup.sql', 'utf16le');
if (sql.charCodeAt(0) === 0xFEFF) {
  sql = sql.slice(1);
}

const hash = bcrypt.hashSync('password123', 10);
sql += `\n\nINSERT INTO "User" (id, email, "passwordHash", role, name, "isActive", "createdAt", "updatedAt") VALUES ('cuid-admin-1', 'admin@esharanatural.com', '${hash}', 'ADMIN', 'Admin User', true, NOW(), NOW());\n`;

fs.writeFileSync('setup_encoded.sql', sql, 'utf8');
console.log('SQL generated successfully.');
