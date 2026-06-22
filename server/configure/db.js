const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mini_blog_app",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// module.exports = pool;

const mockDb = require("../seed/mockDb");

let dbRefused = false;

const isConnectionRefused = (err) => {
  return err && (
    err.code === "ECONNREFUSED" ||
    err.code === "ETIMEDOUT" ||
    err.code === "ENOTFOUND" ||
    err.message.includes("ECONNREFUSED") ||
    err.message.includes("connect")
  );
};

pool.getConnection()
  .then((conn) => {
    console.log("Database connected successfully! Using actual database data.");
    conn.release();
  })
  .catch((err) => {
    if (isConnectionRefused(err)) {
      console.warn("Database connection refused. Falling back to in-memory Seed Data!");
      dbRefused = true;
    }
  });

function wrapConnection(conn) {
  return {
    async beginTransaction() {
      try {
        return await conn.beginTransaction();
      } catch (err) {
        if (isConnectionRefused(err)) {
          dbRefused = true;
        }
        throw err;
      }
    },
    async commit() {
      try {
        return await conn.commit();
      } catch (err) {
        if (isConnectionRefused(err)) {
          dbRefused = true;
        }
        throw err;
      }
    },
    async rollback() {
      try {
        return await conn.rollback();
      } catch (err) {
        if (isConnectionRefused(err)) {
          dbRefused = true;
        }
        throw err;
      }
    },
    async execute(sql, params) {
      try {
        return await conn.execute(sql, params);
      } catch (err) {
        if (isConnectionRefused(err)) {
          dbRefused = true;
          console.warn("Database connection lost during conn.execute. Switched to mock database.");
          const mockConn = await mockDb.getConnection();
          return mockConn.execute(sql, params);
        }
        throw err;
      }
    },
    async query(sql, params) {
      try {
        return await conn.query(sql, params);
      } catch (err) {
        if (isConnectionRefused(err)) {
          dbRefused = true;
          console.warn("Database connection lost during conn.query. Switched to mock database.");
          const mockConn = await mockDb.getConnection();
          return mockConn.query(sql, params);
        }
        throw err;
      }
    },
    release() {
      try {
        conn.release();
      } catch (err) {
        // no-op if release fails due to connection drop
      }
    }
  };
}

const dbWrapper = {
  async execute(sql, params) {
    if (dbRefused) {
      return mockDb.execute(sql, params);
    }
    try {
      return await pool.execute(sql, params);
    } catch (err) {
      if (isConnectionRefused(err)) {
        console.warn("Database connection lost or refused during execute. Falling back to in-memory Seed Data!");
        dbRefused = true;
        return mockDb.execute(sql, params);
      }
      throw err;
    }
  },

  async query(sql, params) {
    if (dbRefused) {
      return mockDb.query(sql, params);
    }
    try {
      return await pool.query(sql, params);
    } catch (err) {
      if (isConnectionRefused(err)) {
        console.warn("Database connection lost or refused during query. Falling back to in-memory Seed Data!");
        dbRefused = true;
        return mockDb.query(sql, params);
      }
      throw err;
    }
  },

  async getConnection() {
    if (dbRefused) {
      return mockDb.getConnection();
    }
    try {
      const conn = await pool.getConnection();
      return wrapConnection(conn);
    } catch (err) {
      if (isConnectionRefused(err)) {
        console.warn("Database connection refused during getConnection. Falling back to in-memory Seed Data!");
        dbRefused = true;
        return mockDb.getConnection();
      }
      throw err;
    }
  }
};

module.exports = dbWrapper;

