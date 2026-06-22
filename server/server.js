require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const rootRoutes = require("./routes/rootRoutes");

const path = require("path");
const cors = require("cors");

const app = express();

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", rootRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Running on port ${port}...`);
});
