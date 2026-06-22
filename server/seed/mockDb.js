const { staticCategories, seedUsers, seedPosts, seedTags, seedPostTags } = require("./seedData");

let users = [...seedUsers];
let posts = [...seedPosts];
const categories = [...staticCategories];
let tags = [...seedTags];
let post_tags = [...seedPostTags];
let refresh_tokens = [];

let nextUserId = users.length + 1;
let nextPostId = posts.length + 1;
let nextTagId = tags.length + 1;
let nextRefreshTokenId = 1;

function executeSql(sql, params = []) {
  const cleanSql = sql.replace(/\s+/g, " ").trim();
  const upperSql = cleanSql.toUpperCase();

  // 1. SELECT username FROM users WHERE id = ?
  if (upperSql.startsWith("SELECT USERNAME FROM USERS WHERE ID = ?")) {
    const userId = Number(params[0]);
    const user = users.find(u => u.id === userId);
    return [user ? [{ username: user.username }] : [], undefined];
  }

  // 2. SELECT id FROM users WHERE email = ?
  if (upperSql.startsWith("SELECT ID FROM USERS WHERE EMAIL = ?")) {
    const email = params[0];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return [user ? [{ id: user.id }] : [], undefined];
  }

  // 3. INSERT INTO users (username, email, password) VALUES (?,?,?)
  if (upperSql.startsWith("INSERT INTO USERS (USERNAME, EMAIL, PASSWORD)")) {
    const [username, email, password] = params;
    const newId = nextUserId++;
    const newUser = {
      id: newId,
      username,
      email,
      password,
      role: "user",
      created_at: new Date()
    };
    users.push(newUser);
    return [{ insertId: newId }, undefined];
  }

  // 4. SELECT id, email,role, password FROM users WHERE email = ?
  if (upperSql.startsWith("SELECT ID, EMAIL,ROLE, PASSWORD FROM USERS WHERE EMAIL = ?") ||
      upperSql.startsWith("SELECT ID, EMAIL, ROLE, PASSWORD FROM USERS WHERE EMAIL = ?") ||
      upperSql.startsWith("SELECT ID, EMAIL, ROLE, PASSWORD FROM USERS WHERE EMAIL=?") ||
      upperSql.startsWith("SELECT ID, EMAIL,ROLE, PASSWORD FROM USERS WHERE EMAIL=?")) {
    const email = params[0];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return [user ? [{ id: user.id, email: user.email, role: user.role, password: user.password }] : [], undefined];
  }

  // 5. SELECT id FROM refresh_tokens WHERE user_id = ?
  if (upperSql.startsWith("SELECT ID FROM REFRESH_TOKENS WHERE USER_ID = ?")) {
    const userId = Number(params[0]);
    const tokenRecord = refresh_tokens.find(t => t.user_id === userId);
    return [tokenRecord ? [{ id: tokenRecord.id }] : [], undefined];
  }

  // 6. INSERT INTO refresh_tokens (user_id, token)VALUES (?,?) or similar
  if (upperSql.includes("INSERT INTO REFRESH_TOKENS") && upperSql.includes("VALUES")) {
    const [userId, token] = params;
    const newId = nextRefreshTokenId++;
    refresh_tokens.push({
      id: newId,
      user_id: Number(userId),
      token
    });
    return [{ insertId: newId }, undefined];
  }

  // 7. UPDATE `refresh_tokens` SET `token` = ? WHERE user_id = ? or update refresh_tokens set token = ?
  if (upperSql.includes("UPDATE") && upperSql.includes("REFRESH_TOKENS") && upperSql.includes("USER_ID = ?")) {
    const [token, userId] = params;
    const record = refresh_tokens.find(t => t.user_id === Number(userId));
    if (record) {
      record.token = token;
    } else {
      refresh_tokens.push({
        id: nextRefreshTokenId++,
        user_id: Number(userId),
        token
      });
    }
    return [{ affectedRows: 1 }, undefined];
  }

  // 8. DELETE FROM refresh_tokens WHERE user_id = ?
  if (upperSql.startsWith("DELETE FROM REFRESH_TOKENS WHERE USER_ID = ?")) {
    const userId = Number(params[0]);
    const initialLen = refresh_tokens.length;
    refresh_tokens = refresh_tokens.filter(t => t.user_id !== userId);
    return [{ affectedRows: initialLen - refresh_tokens.length }, undefined];
  }

  // 9. SELECT COUNT(DISTINCT pt.tag_id) AS total_tags FROM post_tags pt JOIN posts p ON p.id = pt.post_id WHERE p.author_id = ?
  if (upperSql.includes("COUNT(DISTINCT PT.TAG_ID) AS TOTAL_TAGS")) {
    const authorId = Number(params[0]);
    const authorPosts = posts.filter(p => p.author_id === authorId);
    const postIds = authorPosts.map(p => p.id);
    const matchingPostTags = post_tags.filter(pt => postIds.includes(pt.post_id));
    const uniqueTagIds = new Set(matchingPostTags.map(pt => pt.tag_id));
    return [[{ total_tags: uniqueTagIds.size }], undefined];
  }

  // 10. SELECT COUNT(DISTINCT id) AS total_posts , COUNT(DISTINCT category_id) AS total_categories FROM posts WHERE author_id = ?
  if (upperSql.includes("COUNT(DISTINCT ID) AS TOTAL_POSTS")) {
    const authorId = Number(params[0]);
    const authorPosts = posts.filter(p => p.author_id === authorId);
    const uniqueCategories = new Set(authorPosts.map(p => p.category_id));
    return [[{ total_posts: authorPosts.length, total_categories: uniqueCategories.size }], undefined];
  }

  // 11. SELECT p.id , p.title, p.category_id, c.name AS category, p.image , p.created_at FROM posts p JOIN categories c ON c.id = p.category_id WHERE p.author_id = ? ORDER BY p.created_at DESC Limit 3
  if (upperSql.includes("WHERE P.AUTHOR_ID = ?") && upperSql.includes("ORDER BY P.CREATED_AT DESC") && upperSql.includes("LIMIT 3")) {
    const authorId = Number(params[0]);
    const authorPosts = posts.filter(p => p.author_id === authorId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
    const rows = authorPosts.map(p => {
      const cat = categories.find(c => c.id === p.category_id);
      return {
        id: p.id,
        title: p.title,
        category_id: p.category_id,
        category: cat ? cat.name : "",
        image: p.image,
        created_at: p.created_at
      };
    });
    return [rows, undefined];
  }

  // 12. SELECT c.name, COUNT(p.id) as post_count FROM posts p ... WHERE p.author_id = ? GROUP BY c.id ORDER BY post_count DESC LIMIT 3
  if (upperSql.includes("POST_COUNT") && upperSql.includes("WHERE P.AUTHOR_ID = ?") && upperSql.includes("GROUP BY C.ID")) {
    const authorId = Number(params[0]);
    const authorPosts = posts.filter(p => p.author_id === authorId);
    const counts = {};
    authorPosts.forEach(p => {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });
    const rows = Object.keys(counts).map(catId => {
      const cat = categories.find(c => c.id === Number(catId));
      return {
        name: cat ? cat.name : "",
        post_count: counts[catId]
      };
    }).sort((a, b) => b.post_count - a.post_count).slice(0, 3);
    return [rows, undefined];
  }

  // 13. SELECT COUNT(id) AS total_posts FROM posts
  if (upperSql.includes("SELECT COUNT(ID) AS TOTAL_POSTS FROM POSTS") || upperSql.includes("SELECT COUNT (ID) AS TOTAL_POSTS FROM POSTS")) {
    return [[{ total_posts: posts.length }], undefined];
  }

  // 13b. SELECT COUNT(id) AS total FROM posts
  if (upperSql.includes("SELECT COUNT(ID) AS TOTAL FROM POSTS")) {
    return [[{ total: posts.length }], undefined];
  }

  // 14. SELECT COUNT (id) AS total_users FROM users or SELECT COUNT(id) AS total_users FROM users
  if (upperSql.includes("TOTAL_USERS")) {
    return [[{ total_users: users.length }], undefined];
  }

  // 15. SELECT COUNT (id) AS total_tags FROM tags or SELECT COUNT(id) AS total_tags FROM tags
  if (upperSql.includes("TOTAL_TAGS") && !upperSql.includes("POST_TAGS")) {
    return [[{ total_tags: tags.length }], undefined];
  }

  // 16. SELECT COUNT (id) AS total_categories FROM categories or SELECT COUNT(id) AS total_categories FROM categories
  if (upperSql.includes("TOTAL_CATEGORIES") && !upperSql.includes("POSTS")) {
    return [[{ total_categories: categories.length }], undefined];
  }

  // 17. SELECT c.name, COUNT(p.id) as post_count FROM posts p JOIN categories c ON c.id = p.category_id GROUP BY c.id ORDER BY post_count DESC LIMIT 3
  if (upperSql.includes("POST_COUNT") && upperSql.includes("GROUP BY C.ID") && !upperSql.includes("AUTHOR_ID")) {
    const counts = {};
    posts.forEach(p => {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });
    const rows = Object.keys(counts).map(catId => {
      const cat = categories.find(c => c.id === Number(catId));
      return {
        name: cat ? cat.name : "",
        post_count: counts[catId]
      };
    }).sort((a, b) => b.post_count - a.post_count).slice(0, 3);
    return [rows, undefined];
  }

  // 18. SELECT p.id , p.title, p.category_id, c.name AS category, p.image , p.created_at FROM posts p JOIN categories c ON c.id = p.category_id ORDER BY p.created_at DESC LIMIT 5
  if (upperSql.includes("P.CREATED_AT DESC LIMIT 5") && !upperSql.includes("AUTHOR_ID")) {
    const sortedPosts = [...posts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    const rows = sortedPosts.map(p => {
      const cat = categories.find(c => c.id === p.category_id);
      return {
        id: p.id,
        title: p.title,
        category_id: p.category_id,
        category: cat ? cat.name : "",
        image: p.image,
        created_at: p.created_at
      };
    });
    return [rows, undefined];
  }

  // 19. SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5
  if (upperSql.includes("SELECT ID, USERNAME, EMAIL, ROLE, CREATED_AT FROM USERS ORDER BY CREATED_AT DESC LIMIT 5") ||
      upperSql.includes("SELECT ID, USERNAME, EMAIL, ROLE, CREATED_AT FROM USERS ORDER BY CREATED_AT DESC LIMIT 5")) {
    const sortedUsers = [...users]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    const rows = sortedUsers.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      created_at: u.created_at
    }));
    return [rows, undefined];
  }

  // 20. SELECT id FROM categories WHERE id = ?
  if (upperSql.startsWith("SELECT ID FROM CATEGORIES WHERE ID = ?")) {
    const catId = Number(params[0]);
    const cat = categories.find(c => c.id === catId);
    return [cat ? [{ id: cat.id }] : [], undefined];
  }

  // 21. SELECT id FROM tags WHERE name IN(...)
  if (upperSql.includes("FROM TAGS WHERE NAME IN")) {
    const names = params;
    const matched = tags.filter(t => names.includes(t.name));
    return [matched, undefined];
  }

  // 22. INSERT INTO posts (title, content, image, category_id, author_id) VALUES (?,?,?,?,?)
  if (upperSql.startsWith("INSERT INTO POSTS (TITLE, CONTENT, IMAGE, CATEGORY_ID, AUTHOR_ID)")) {
    const [title, content, image, category_id, author_id] = params;
    const newId = nextPostId++;
    const newPost = {
      id: newId,
      title,
      content,
      image,
      category_id: Number(category_id),
      author_id: Number(author_id),
      created_at: new Date(),
      updated_at: new Date()
    };
    posts.push(newPost);
    return [{ insertId: newId }, undefined];
  }

  // 23. INSERT IGNORE INTO tags (name) VALUES ?
  if (upperSql.startsWith("INSERT IGNORE INTO TAGS (NAME)")) {
    const tagRows = params[0] || [];
    let affectedRows = 0;
    tagRows.forEach(row => {
      const name = row[0];
      if (!tags.some(t => t.name === name)) {
        tags.push({ id: nextTagId++, name });
        affectedRows++;
      }
    });
    return [{ affectedRows }, undefined];
  }

  // 24. INSERT INTO post_tags (post_id, tag_id) VALUES ?
  if (upperSql.startsWith("INSERT INTO POST_TAGS (POST_ID, TAG_ID)")) {
    const relations = params[0] || [];
    relations.forEach(([postId, tagId]) => {
      post_tags.push({ post_id: Number(postId), tag_id: Number(tagId) });
    });
    return [{ affectedRows: relations.length }, undefined];
  }

  // 25. SELECT p.id, title, content ,image, c.id AS category_id, c.name AS category, p.created_at, u.id AS author_id, u.username AS author, GROUP_CONCAT(t.name) AS tags
  if (upperSql.includes("GROUP_CONCAT(T.NAME)") && upperSql.includes("FROM POSTS P")) {
    const isMyPosts = upperSql.includes("WHERE P.AUTHOR_ID = ?");
    let authorId;
    let offset;
    let limit;

    if (isMyPosts) {
      authorId = Number(params[0]);
      offset = Number(params[1]);
      limit = Number(params[2]);
    } else {
      const isSinglePost = upperSql.includes("WHERE P.ID = ?");
      if (isSinglePost) {
        const postId = Number(params[0]);
        const post = posts.find(p => p.id === postId);
        if (!post) return [[], undefined];
        const user = users.find(u => u.id === post.author_id);
        const cat = categories.find(c => c.id === post.category_id);
        const pt = post_tags.filter(relation => relation.post_id === post.id);
        const postTagNames = pt.map(relation => {
          const t = tags.find(tag => tag.id === relation.tag_id);
          return t ? t.name : null;
        }).filter(Boolean);
        return [[{
          id: post.id,
          title: post.title,
          content: post.content,
          image: post.image,
          category_id: post.category_id,
          category: cat ? cat.name : "",
          created_at: post.created_at,
          updated_at: post.updated_at || post.created_at,
          author_id: post.author_id,
          author: user ? user.username : "",
          tags: postTagNames.join(",")
        }], undefined];
      }

      offset = Number(params[0]);
      limit = Number(params[1]);
    }

    let filteredPosts = posts;
    if (isMyPosts) {
      filteredPosts = posts.filter(p => p.author_id === authorId);
    }

    const sorted = [...filteredPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const paginated = sorted.slice(offset, offset + limit);

    const rows = paginated.map(post => {
      const user = users.find(u => u.id === post.author_id);
      const cat = categories.find(c => c.id === post.category_id);
      const pt = post_tags.filter(relation => relation.post_id === post.id);
      const postTagNames = pt.map(relation => {
        const t = tags.find(tag => tag.id === relation.tag_id);
        return t ? t.name : null;
      }).filter(Boolean);

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        image: post.image,
        category_id: post.category_id,
        category: cat ? cat.name : "",
        created_at: post.created_at,
        updated_at: post.updated_at || post.created_at,
        author_id: post.author_id,
        author: user ? user.username : "",
        tags: postTagNames.join(",")
      };
    });
    return [rows, undefined];
  }

  // 26. SELECT id, image FROM posts WHERE id = ? AND author_id = ?
  if (upperSql.startsWith("SELECT ID, IMAGE FROM POSTS WHERE ID = ? AND AUTHOR_ID = ?")) {
    const [postId, authorId] = params;
    const post = posts.find(p => p.id === Number(postId) && p.author_id === Number(authorId));
    return [post ? [{ id: post.id, image: post.image }] : [], undefined];
  }

  // 27. UPDATE posts SET ? WHERE id = ? AND author_id = ?
  if (upperSql.startsWith("UPDATE POSTS SET ? WHERE ID = ? AND AUTHOR_ID = ?")) {
    const [fields, postId, authorId] = params;
    const post = posts.find(p => p.id === Number(postId) && p.author_id === Number(authorId));
    if (post) {
      Object.assign(post, fields);
      post.updated_at = new Date();
      return [{ affectedRows: 1 }, undefined];
    }
    return [{ affectedRows: 0 }, undefined];
  }

  // 28. DELETE FROM tags WHERE id IN (...) AND name NOT IN (...)
  if (upperSql.startsWith("DELETE FROM TAGS WHERE ID IN ( SELECT TAG_ID")) {
    const postId = Number(params[0]);
    const newTags = params.slice(2);

    const currentPostTagIds = post_tags.filter(pt => pt.post_id === postId).map(pt => pt.tag_id);
    const otherPostTagIds = post_tags.filter(pt => pt.post_id !== postId).map(pt => pt.tag_id);
    const onlyThisPostTagIds = currentPostTagIds.filter(id => !otherPostTagIds.includes(id));

    const tagsToDelete = onlyThisPostTagIds.filter(id => {
      const t = tags.find(tag => tag.id === id);
      return t && !newTags.includes(t.name);
    });

    const initialLen = tags.length;
    tags = tags.filter(t => !tagsToDelete.includes(t.id));

    return [{ affectedRows: initialLen - tags.length }, undefined];
  }

  // 29. DELETE FROM post_tags WHERE post_id = ?
  if (upperSql.startsWith("DELETE FROM POST_TAGS WHERE POST_ID = ?")) {
    const postId = Number(params[0]);
    const initialLen = post_tags.length;
    post_tags = post_tags.filter(pt => pt.post_id !== postId);
    return [{ affectedRows: initialLen - post_tags.length }, undefined];
  }

  // 30. SELECT tag_id FROM post_tags WHERE post_id = ? AND tag_id NOT IN(SELECT tag_id FROM post_tags WHERE post_id <> ?)
  if (upperSql.includes("SELECT TAG_ID FROM POST_TAGS WHERE POST_ID = ?") && upperSql.includes("POST_ID <> ?")) {
    const postId = Number(params[0]);
    const otherPostTagIds = post_tags.filter(pt => pt.post_id !== postId).map(pt => pt.tag_id);
    const myPostTags = post_tags.filter(pt => pt.post_id === postId);
    const result = myPostTags
      .filter(pt => !otherPostTagIds.includes(pt.tag_id))
      .map(pt => ({ tag_id: pt.tag_id }));
    return [result, undefined];
  }

  // 31. SELECT id, author_id, image FROM posts WHERE id = ?
  if (upperSql.startsWith("SELECT ID, AUTHOR_ID, IMAGE FROM POSTS WHERE ID = ?")) {
    const postId = Number(params[0]);
    const post = posts.find(p => p.id === postId);
    return [post ? [{ id: post.id, author_id: post.author_id, image: post.image }] : [], undefined];
  }

  // 32. DELETE FROM posts WHERE id = ?
  if (upperSql.startsWith("DELETE FROM POSTS WHERE ID = ?")) {
    const postId = Number(params[0]);
    const initialLen = posts.length;
    posts = posts.filter(p => p.id !== postId);
    return [{ affectedRows: initialLen - posts.length }, undefined];
  }

  // 33. DELETE FROM tags WHERE id IN (...)
  if (upperSql.startsWith("DELETE FROM TAGS WHERE ID IN (")) {
    const idsToDelete = params.map(Number);
    const initialLen = tags.length;
    tags = tags.filter(t => !idsToDelete.includes(t.id));
    return [{ affectedRows: initialLen - tags.length }, undefined];
  }

  console.warn("Unmatched Mock SQL Query:", cleanSql, params);
  return [[], undefined];
}

class MockConnection {
  async beginTransaction() {
    // transactions are no-ops in memory
  }

  async commit() {
    // transactions are no-ops in memory
  }

  async rollback() {
    // transactions are no-ops in memory
  }

  async execute(sql, params) {
    return executeSql(sql, params);
  }

  async query(sql, params) {
    return executeSql(sql, params);
  }

  release() {
    // no-op in memory
  }
}

class MockPool {
  async execute(sql, params) {
    return executeSql(sql, params);
  }

  async query(sql, params) {
    return executeSql(sql, params);
  }

  async getConnection() {
    return new MockConnection();
  }
}

module.exports = new MockPool();
