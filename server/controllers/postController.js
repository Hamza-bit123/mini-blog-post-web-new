const pool = require("../configure/db");
const fs = require("fs");
const path = require("path");

const createPost = async (req, res) => {
  const { title, content, category_id, tags } = req.body;
  const image = req.file?.filename || null;
  const arrayTags = tags?.map((tag) => [tag]);

  const placeholders = tags?.map(() => "?").join(",");

  //Queries
  const getCategory_id = "SELECT id FROM categories WHERE id = ?";

  const getTags = `SELECT id FROM tags WHERE name IN(${placeholders})`;

  const postInsert =
    "INSERT INTO posts (title, content, image, category_id, author_id) VALUES (?,?,?,?,?)";

  const tagInsert = "INSERT IGNORE INTO tags (name) VALUES ?";

  const post_tagInsert = "INSERT INTO post_tags (post_id, tag_id) VALUES ?";

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    //Check category id validity
    const [category] = await conn.execute(getCategory_id, [category_id]);

    if (category.length === 0)
      return res
        .status(400)
        .json({ success: false, error: "Invalid category id" });

    const [postsResult] = await conn.execute(postInsert, [
      title,
      content,
      image,
      category_id,
      req.user?.id,
    ]);

    await conn.query(tagInsert, [arrayTags]);

    const [tagIds] = await conn.execute(getTags, tags);

    const relation = tagIds.map((t) => [postsResult.insertId, t.id]);

    const [post_tagResult] = await conn.query(post_tagInsert, [relation]);

    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      post: {
        id: postsResult.insertId,
        title,
        content,
        image,
        category_id,
        author_id: req.user.id,
        tags,
      },
      relations: post_tagResult,
    });
  } catch (error) {
    console.log(error.message);
    await conn.rollback();

    //delete image if uploaded

    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log({ error: err.message });
      });
    }

    res.status(500).json({ success: false, error: "Server Error!" });
  } finally {
    conn.release();
  }
};

const returnPosts = async (req, res) => {
  try {
    const limit = req.query.limit ? req.query.limit : 10;
    const page = req.query.page ? req.query.page : 1;
    const offset = (page - 1) * limit;

    const sql = `SELECT p.id, title, content ,image, c.id AS category_id, c.name AS category, p.created_at, u.id AS author_id, u.username AS author, GROUP_CONCAT(t.name)  AS tags 
              FROM posts p
              JOIN users u ON u.id = p.author_id
              JOIN categories c ON c.id = p.category_id
              LEFT JOIN post_tags pt ON pt.post_id = p.id
              LEFT JOIN tags t ON t.id = pt.tag_id
              GROUP BY p.id
              ORDER BY p.created_at DESC
              LIMIT ?,?`;

    const totalPostsSql = `SELECT COUNT(id) AS total FROM posts`;

    const [posts] = await pool.execute(sql, [offset, limit]);
    const [totalPosts] = await pool.execute(totalPostsSql);

    const formattedPosts = posts?.map((p) => ({
      ...p,
      tags: p.tags ? p.tags.split(",") : [],
    }));

    res.json({
      success: true,
      data: { posts: formattedPosts, totalPosts: totalPosts[0].total },
    });
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const returnMyposts = async (req, res) => {
  const limit = req.query.limit ? req.query.limit : 10;
  const page = req.query.page ? req.query.page : 1;
  const offset = (page - 1) * limit;

  const sql = `SELECT p.id, title, content ,image, c.id AS category_id, c.name AS category, p.created_at, u.id AS author_id, u.username AS author, GROUP_CONCAT(t.name)  AS tags 
              FROM posts p
              JOIN users u ON u.id = p.author_id
              JOIN categories c ON c.id = p.category_id
              LEFT JOIN post_tags pt ON pt.post_id = p.id
              LEFT JOIN tags t ON t.id = pt.tag_id
              WHERE p.author_id = ?
              GROUP BY p.id
              ORDER BY p.created_at DESC
              LIMIT ?,?`;

  try {
    const user_id = req.user?.id;

    const [posts] = await pool.execute(sql, [user_id, offset, limit]);

    const formattedPosts = posts?.map((p) => ({
      ...p,
      tags: p.tags ? p.tags.split(",") : [],
    }));

    res.json({ success: true, data: formattedPosts });
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const returnPost = async (req, res) => {
  const sql = `SELECT p.id, p.title, p.content, p.image , c.id AS category_id, c.name AS category, p.created_at , u.id AS author_id, u.username AS author, GROUP_CONCAT(t.name)  AS tags 
              FROM posts p
              JOIN users u ON u.id = p.author_id
              JOIN categories c ON c.id = p.category_id
              LEFT JOIN post_tags pt ON pt.post_id = p.id
              LEFT JOIN tags t ON t.id = pt.tag_id
              WHERE p.id = ?
              GROUP BY p.id`;

  const post_id = req.params.id;

  try {
    const [post] = await pool.execute(sql, [post_id]);

    if (post.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "Resource not found!" });

    const formattedPost = {
      ...post[0],
      tags: post[0].tags ? post[0].tags.split(",") : [],
    };

    res.json({ success: true, data: formattedPost });
  } catch (error) {
    console.log("Error: " + error.name + " " + error.message);
    res.status(500).json({ success: false, error: "Server error!" });
  }
};

const updatePost = async (req, res) => {
  const post_id = req.params.id;
  const user_id = req.user.id;
  const tags = req.body.tags;
  const arrayTags = tags?.map((t) => [t]);

  const placeholders = tags?.map((t) => "?").join(",");

  const getPostSql =
    "SELECT id, image FROM posts WHERE id = ?  AND author_id = ?";

  const updatePostSql = "UPDATE posts SET ? WHERE id = ? AND author_id = ?";

  const deleteTags = `DELETE FROM tags WHERE id IN (
                      SELECT tag_id
                      FROM post_tags
                      WHERE post_id = ?
                      AND tag_id NOT IN(SELECT tag_id 
                      FROM post_tags 
                      WHERE post_id <> ?)) AND name NOT IN (${placeholders})`;

  const deleteRelations = "DELETE FROM post_tags WHERE post_id = ?";

  const getTags = `SELECT id FROM tags WHERE name IN (${placeholders})`;

  const insertTags = "INSERT IGNORE INTO tags (name) VALUES ?";

  const insertRelations = "INSERT INTO post_tags (post_id, tag_id) VALUES ?";

  const getNewPost = `SELECT p.id, p.title, p.content, p.image , c.id AS category_id, c.name AS category, p.created_at, p.updated_at , u.id AS author_id, u.username AS author, GROUP_CONCAT(t.name)  AS tags 
                      FROM posts p
                      JOIN users u ON u.id = p.author_id
                      JOIN categories c ON c.id = p.category_id
                      LEFT JOIN post_tags pt ON pt.post_id = p.id
                      LEFT JOIN tags t ON t.id = pt.tag_id
                      WHERE p.id = ?
                      GROUP BY p.id`;

  if (Object.keys(req.body).length === 0 && !req.file)
    return res
      .status(400)
      .json({ success: false, error: "Nothing to update!" });

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    //checking the existance of the post and authorization of the user

    const [post] = await conn.execute(getPostSql, [post_id, user_id]);

    if (post.length === 0) {
      if (req.file) {
        fs.unlink(req.file.path, (error) => {
          if (error) console.log(error.message);
        });
      }
      return res
        .status(404)
        .json({ success: false, error: "Resource not found!" });
    }

    const postFields = req.body;
    delete postFields.tags;

    if (req.file) postFields.image = req.file.filename;

    const keys = Object.keys(postFields);

    if (keys.length !== 0)
      await conn.query(updatePostSql, [postFields, post_id, user_id]);

    //controlling tag updates

    let tagIds;

    if (tags) {
      await conn.execute(deleteTags, [post_id, post_id, ...tags]);

      await conn.execute(deleteRelations, [post_id]);

      await conn.query(insertTags, [arrayTags]);

      [tagIds] = await conn.execute(getTags, tags);

      const relations = tagIds.map((t) => [post_id, t.id]);

      await conn.query(insertRelations, [relations]);
    }

    const [updatedPost] = await conn.execute(getNewPost, [post_id]);

    const formattedPost = {
      ...updatedPost[0],
      tags: updatedPost[0].tags ? updatedPost[0].tags.split(",") : [],
    };

    await conn.commit();

    // if (req.file) {
    //   const oldImagePath = path.join(__dirname, "../uploads", post[0].image);
    //   fs.unlink(oldImagePath, (err) => {
    //     if (err) console.log("error: " + err.message);
    //   });
    // }
    if (req.file && post[0].image) {
      const oldImagePath = path.join(__dirname, "../uploads", post[0].image);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.log("error: " + err.message);
      });
    }
    res.json({
      success: true,
      message: "Post updated successfully!",
      post: formattedPost,
    });
  } catch (error) {
    console.log("Error: " + error.message);
    await conn.rollback();

    //delete image if uploaded

    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        if (error) console.log(error.message);
      });
    }

    res.status(500).json({ success: false, error: "Server error!" });
  } finally {
    conn.release();
  }
};

const deletePost = async (req, res) => {
  const post_id = req.params.id;
  const role = req.user.role;
  const user_id = req.user.id;
  let placeholders;
  let arrayTagIds;

  const getTagIds = ` SELECT tag_id
                        FROM post_tags
                        WHERE post_id = ?
                        AND tag_id NOT IN(SELECT tag_id 
                        FROM post_tags 
                        WHERE post_id <> ?)`;

  try {
    const [tagIds] = await pool.execute(getTagIds, [post_id, post_id]);

    arrayTagIds = tagIds && tagIds.map((t) => t.tag_id);

    placeholders = tagIds.map(() => "?").join(",");
  } catch (error) {
    console.log("error: " + error.message);
    res.status(500).json({ success: false, error: error.message });
  }

  const getPostSql = "SELECT id, author_id, image FROM posts WHERE id = ?";
  const deletePost = "DELETE FROM posts WHERE id = ?";
  const deleteRelations = "DELETE FROM post_tags WHERE post_id = ?";
  const deleteTags = `DELETE FROM tags WHERE id IN (${placeholders})`;

  //Start transaction
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const [post] = await conn.execute(getPostSql, [post_id]);

    if (post.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "Resource not found!" });

    if (role !== "admin" && post[0].author_id !== user_id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    await conn.execute(deleteRelations, [post_id]);
    await conn.execute(deletePost, [post_id]);
    if (arrayTagIds.length) await conn.execute(deleteTags, arrayTagIds);

    await conn.commit();

    if (post[0].image) {
      const oldImagePath = path.join(__dirname, "../uploads", post[0].image);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.log("Error: " + err.message);
      });
    }

    res.json({
      success: true,
      message: "Successfully deleted!",
    });
  } catch (error) {
    await conn.rollback();
    console.log("error: " + error.message);
    res.status(500).json({ success: false, error: "Server error" });
  } finally {
    conn.release();
  }
};

module.exports = {
  createPost,
  returnPosts,
  returnMyposts,
  returnPost,
  updatePost,
  deletePost,
};
