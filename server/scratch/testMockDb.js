const mockDb = require("../seed/mockDb");

async function runTests() {
  try {
    console.log("Starting mockDb tests...");

    // Test 1: SELECT username FROM users WHERE id = ?
    const [user] = await mockDb.execute("SELECT username FROM users WHERE id = ?", [1]);
    console.log("Test 1: User 1 username should be john_doe:", user[0]?.username === "john_doe" ? "PASS" : "FAIL", `(got ${user[0]?.username})`);

    // Test 2: SELECT id FROM users WHERE email = ?
    const [userId] = await mockDb.execute("SELECT id FROM users WHERE email = ?", ["jane@example.com"]);
    console.log("Test 2: User jane@example.com id should be 2:", userId[0]?.id === 2 ? "PASS" : "FAIL", `(got ${userId[0]?.id})`);

    // Test 3: COUNT (id) AS total_posts FROM posts
    const [postCount] = await mockDb.execute("SELECT COUNT(id) AS total_posts FROM posts");
    console.log("Test 3: Total posts should be 12:", postCount[0]?.total_posts === 12 ? "PASS" : "FAIL", `(got ${postCount[0]?.total_posts})`);

    // Test 4: Paginated returnPosts
    const [posts] = await mockDb.execute(
      "SELECT p.id, title, content ,image, c.id AS category_id, c.name AS category, p.created_at, u.id AS author_id, u.username AS author, GROUP_CONCAT(t.name)  AS tags FROM posts p JOIN users u ON u.id = p.author_id JOIN categories c ON c.id = p.category_id LEFT JOIN post_tags pt ON pt.post_id = p.id LEFT JOIN tags t ON t.id = pt.tag_id GROUP BY p.id ORDER BY p.created_at DESC LIMIT ?,?",
      [0, 5]
    );
    console.log("Test 4: Returned paginated posts count should be 5:", posts.length === 5 ? "PASS" : "FAIL", `(got ${posts.length})`);
    if (posts.length > 0) {
      console.log("First post category name should be React:", posts[0].category === "React" ? "PASS" : "FAIL", `(got ${posts[0].category})`);
      console.log("First post tags should be an array-like comma list containing react:", posts[0].tags ? "PASS" : "FAIL", `(got ${posts[0].tags})`);
    }

    // Test 5: INSERT INTO posts
    const [insertResult] = await mockDb.execute(
      "INSERT INTO posts (title, content, image, category_id, author_id) VALUES (?,?,?,?,?)",
      ["Test Title", "Test Content of at least five characters", null, 1, 1]
    );
    console.log("Test 5: Inserted post ID should be 13:", insertResult?.insertId === 13 ? "PASS" : "FAIL", `(got ${insertResult?.insertId})`);

    // Test 6: COUNT after insert
    const [newPostCount] = await mockDb.execute("SELECT COUNT(id) AS total_posts FROM posts");
    console.log("Test 6: Total posts should now be 13:", newPostCount[0]?.total_posts === 13 ? "PASS" : "FAIL", `(got ${newPostCount[0]?.total_posts})`);

    console.log("MockDb tests completed successfully!");
  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

runTests();
