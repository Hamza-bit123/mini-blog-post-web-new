const mockDb = require("../seed/mockDb");
const bcrypt = require("bcryptjs");

async function testLogin(email, password) {
  try {
    let sql = "SELECT id, email,role, password FROM users WHERE email = ?";
    const [result] = await mockDb.execute(sql, [email]);

    if (result.length === 0) {
      console.log(`Login for ${email}: FAIL - User not found`);
      return;
    }

    const isMatch = await bcrypt.compare(password, result[0].password);
    if (!isMatch) {
      console.log(`Login for ${email}: FAIL - Invalid credentials (password mismatch)`);
      return;
    }

    console.log(`Login for ${email}: PASS - Successfully logged in as ${result[0].role}!`);
  } catch (err) {
    console.error(`Login for ${email} error:`, err);
  }
}

async function run() {
  console.log("Testing with literal values 'password123' and 'adminpassword':");
  await testLogin("john@example.com", "password123");
  await testLogin("admin@example.com", "adminpassword");

  console.log("\nTesting with literal strings 'normalPasswordHash' and 'adminPasswordHash' (which should fail):");
  await testLogin("john@example.com", "normalPasswordHash");
  await testLogin("admin@example.com", "adminPasswordHash");
}

run();
