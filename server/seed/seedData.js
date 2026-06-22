const bcrypt = require("bcryptjs");

const staticCategories = [
  { id: 1, name: "Web Development" },
  { id: 2, name: "Backend" },
  { id: 3, name: "Frontend" },
  { id: 4, name: "Database" },
  { id: 5, name: "JavaScript" },
  { id: 6, name: "Node.js" },
  { id: 7, name: "React" },
  { id: 8, name: "DevOps" },
  { id: 9, name: "Programming Tips" },
  { id: 10, name: "Software Architecture" }
];

const normalPasswordHash = bcrypt.hashSync("password123", 10);
const adminPasswordHash = bcrypt.hashSync("adminpassword", 10);

const seedUsers = [
  { id: 1, username: "john_doe", email: "john@example.com", password: normalPasswordHash, role: "user", created_at: new Date("2026-01-01T12:00:00Z") },
  { id: 2, username: "jane_smith", email: "jane@example.com", password: normalPasswordHash, role: "user", created_at: new Date("2026-01-02T12:00:00Z") },
  { id: 3, username: "bob_jones", email: "bob@example.com", password: normalPasswordHash, role: "user", created_at: new Date("2026-01-03T12:00:00Z") },
  { id: 4, username: "alice_wonder", email: "alice@example.com", password: normalPasswordHash, role: "user", created_at: new Date("2026-01-04T12:00:00Z") },
  { id: 5, username: "charlie_brown", email: "charlie@example.com", password: normalPasswordHash, role: "user", created_at: new Date("2026-01-05T12:00:00Z") },
  { id: 6, username: "admin_user", email: "admin@example.com", password: adminPasswordHash, role: "admin", created_at: new Date("2026-01-06T12:00:00Z") }
];

const seedPosts = [
  {
    id: 1,
    title: "The Future of Web Development in 2026",
    content: "Web development is evolving rapidly. In 2026, we are seeing deeper integration of AI assistants in our daily workflows, server component frameworks becoming the default choice, and edge rendering optimizing delivery for global audiences. Keeping up requires continuous learning and adopting modern toolchains.",
    image: null,
    category_id: 1,
    author_id: 1,
    created_at: new Date("2026-06-10T10:00:00Z"),
    updated_at: new Date("2026-06-10T10:00:00Z")
  },
  {
    id: 2,
    title: "Building Scalable Microservices with Node.js",
    content: "Scaling Node.js microservices involves understanding asynchronous task execution, message queues (like RabbitMQ or Redis), and horizontally scaling stateless servers behind an API Gateway. Keeping latency low requires structured logging and robust performance profiling.",
    image: null,
    category_id: 2,
    author_id: 2,
    created_at: new Date("2026-06-11T11:00:00Z"),
    updated_at: new Date("2026-06-11T11:00:00Z")
  },
  {
    id: 3,
    title: "Mastering CSS Grid and Flexbox Layouts",
    content: "Creating modern layouts is simple once you master CSS Grid and Flexbox. Use Flexbox for one-dimensional components (like navigation bars and button groups) and Grid for complex, two-dimensional page structures. Combining them allows for clean, fully responsive layouts.",
    image: null,
    category_id: 3,
    author_id: 3,
    created_at: new Date("2026-06-12T12:00:00Z"),
    updated_at: new Date("2026-06-12T12:00:00Z")
  },
  {
    id: 4,
    title: "Optimizing MySQL Queries for High-Traffic Apps",
    content: "Slow queries will bottle-neck any database-backed application. By understanding EXPLAIN plans, creating targeted indexes, avoiding wildcards in SELECT, and caching heavy queries using Redis, you can achieve sub-millisecond query execution speeds under heavy load.",
    image: null,
    category_id: 4,
    author_id: 4,
    created_at: new Date("2026-06-13T13:00:00Z"),
    updated_at: new Date("2026-06-13T13:00:00Z")
  },
  {
    id: 5,
    title: "Understanding Closures and Scope in JavaScript",
    content: "Closures are a fundamental JavaScript concept that developers often find confusing. A closure is the combination of a function bundled together with references to its surrounding state. Closures allow inner functions to maintain access to variables in outer scopes even after the outer function executes.",
    image: null,
    category_id: 5,
    author_id: 5,
    created_at: new Date("2026-06-14T14:00:00Z"),
    updated_at: new Date("2026-06-14T14:00:00Z")
  },
  {
    id: 6,
    title: "Deep Dive into Node.js Event Loop",
    content: "The event loop is the secret behind Node.js's non-blocking, asynchronous nature. It coordinates the execution of callbacks, timers, I/O operations, and microtasks across different phases (timers, pending callbacks, idle, poll, check, close). Understanding it helps prevent blocking the main thread.",
    image: null,
    category_id: 6,
    author_id: 1,
    created_at: new Date("2026-06-15T15:00:00Z"),
    updated_at: new Date("2026-06-15T15:00:00Z")
  },
  {
    id: 7,
    title: "State Management in React: Redux vs Context API",
    content: "Choosing between Redux and Context API depends on the complexity of your application. Context API is excellent for light-weight state sharing (like dark mode toggles or user profiles) without extra dependencies. Redux is better suited for complex business logic, trace-ability, and high-frequency updates.",
    image: null,
    category_id: 7,
    author_id: 2,
    created_at: new Date("2026-06-16T16:00:00Z"),
    updated_at: new Date("2026-06-16T16:00:00Z")
  },
  {
    id: 8,
    title: "Setting Up CI/CD Pipelines with GitHub Actions",
    content: "CI/CD automates testing and deployment to ensure fast and reliable software delivery. By writing clean yaml workflows in GitHub Actions, you can automatically run tests, build Docker containers, lint code on every pull request, and deploy code directly to server hostings on main branch merges.",
    image: null,
    category_id: 8,
    author_id: 3,
    created_at: new Date("2026-06-17T17:00:00Z"),
    updated_at: new Date("2026-06-17T17:00:00Z")
  },
  {
    id: 9,
    title: "10 Clean Code Habits Every Developer Should Adopt",
    content: "Writing clean code is about writing code that others can read and maintain easily. Use descriptive names, write small single-responsibility functions, delete commented-out code, write unit tests, and keep architectural principles consistent. Clean code reduces technical debt over time.",
    image: null,
    category_id: 9,
    author_id: 4,
    created_at: new Date("2026-06-18T18:00:00Z"),
    updated_at: new Date("2026-06-18T18:00:00Z")
  },
  {
    id: 10,
    title: "Design Patterns in Modern Software Engineering",
    content: "Design patterns are reusable solutions to commonly occurring software design problems. In this guide, we discuss creational (Singleton, Factory), structural (Adapter, Decorator), and behavioral (Observer, Strategy) design patterns, explaining how they help build extensible architectures.",
    image: null,
    category_id: 10,
    author_id: 5,
    created_at: new Date("2026-06-19T19:00:00Z"),
    updated_at: new Date("2026-06-19T19:00:00Z")
  },
  {
    id: 11,
    title: "Responsive Web Design Principles for Mobile First",
    content: "With mobile traffic making up over half of all web traffic, starting layouts with a mobile-first philosophy is standard practice. Define your base CSS styles for mobile devices, then use media queries to add layout complexity as screen size increases, using responsive units like rem and viewport units.",
    image: null,
    category_id: 1,
    author_id: 1,
    created_at: new Date("2026-06-20T20:00:00Z"),
    updated_at: new Date("2026-06-20T20:00:00Z")
  },
  {
    id: 12,
    title: "Optimizing React Performance with Hooks",
    content: "React is fast by default, but heavy computations or unnecessary re-renders can degrade performance. Developers can optimize re-rendering behaviors by using useMemo to cache expensive calculations, useCallback to memoize callbacks, and React.memo to prevent component re-renders when props don't change.",
    image: null,
    category_id: 7,
    author_id: 2,
    created_at: new Date("2026-06-21T21:00:00Z"),
    updated_at: new Date("2026-06-21T21:00:00Z")
  }
];

const seedTags = [
  { id: 1, name: "web" },
  { id: 2, name: "frontend" },
  { id: 3, name: "trends" },
  { id: 4, name: "tech" },
  { id: 5, name: "node" },
  { id: 6, name: "backend" },
  { id: 7, name: "microservices" },
  { id: 8, name: "architecture" },
  { id: 9, name: "css" },
  { id: 10, name: "design" },
  { id: 11, name: "layout" },
  { id: 12, name: "mysql" },
  { id: 13, name: "database" },
  { id: 14, name: "performance" },
  { id: 15, name: "sql" },
  { id: 16, name: "javascript" },
  { id: 17, name: "closures" },
  { id: 18, name: "coding" },
  { id: 19, name: "scope" },
  { id: 20, name: "eventloop" },
  { id: 21, name: "async" },
  { id: 22, name: "react" },
  { id: 23, name: "redux" },
  { id: 24, name: "state" },
  { id: 25, name: "context" },
  { id: 26, name: "devops" },
  { id: 27, name: "cicd" },
  { id: 28, name: "github" },
  { id: 29, name: "automation" },
  { id: 30, name: "cleancode" },
  { id: 31, name: "programming" },
  { id: 32, name: "tips" },
  { id: 33, name: "software" },
  { id: 34, name: "patterns" },
  { id: 35, name: "oop" },
  { id: 36, name: "responsive" },
  { id: 37, name: "mobile" },
  { id: 38, name: "hooks" },
  { id: 39, name: "optimization" }
];

const seedPostTags = [
  // Post 1
  { post_id: 1, tag_id: 1 }, { post_id: 1, tag_id: 2 }, { post_id: 1, tag_id: 3 }, { post_id: 1, tag_id: 4 },
  // Post 2
  { post_id: 2, tag_id: 5 }, { post_id: 2, tag_id: 6 }, { post_id: 2, tag_id: 7 }, { post_id: 2, tag_id: 8 },
  // Post 3
  { post_id: 3, tag_id: 9 }, { post_id: 3, tag_id: 2 }, { post_id: 3, tag_id: 10 }, { post_id: 3, tag_id: 11 },
  // Post 4
  { post_id: 4, tag_id: 12 }, { post_id: 4, tag_id: 13 }, { post_id: 4, tag_id: 14 }, { post_id: 4, tag_id: 15 },
  // Post 5
  { post_id: 5, tag_id: 16 }, { post_id: 5, tag_id: 17 }, { post_id: 5, tag_id: 18 }, { post_id: 5, tag_id: 19 },
  // Post 6
  { post_id: 6, tag_id: 5 }, { post_id: 6, tag_id: 20 }, { post_id: 6, tag_id: 21 }, { post_id: 6, tag_id: 16 },
  // Post 7
  { post_id: 7, tag_id: 22 }, { post_id: 7, tag_id: 23 }, { post_id: 7, tag_id: 24 }, { post_id: 7, tag_id: 25 },
  // Post 8
  { post_id: 8, tag_id: 26 }, { post_id: 8, tag_id: 27 }, { post_id: 8, tag_id: 28 }, { post_id: 8, tag_id: 29 },
  // Post 9
  { post_id: 9, tag_id: 30 }, { post_id: 9, tag_id: 31 }, { post_id: 9, tag_id: 32 }, { post_id: 9, tag_id: 33 },
  // Post 10
  { post_id: 10, tag_id: 8 }, { post_id: 10, tag_id: 34 }, { post_id: 10, tag_id: 10 }, { post_id: 10, tag_id: 35 },
  // Post 11
  { post_id: 11, tag_id: 1 }, { post_id: 11, tag_id: 9 }, { post_id: 11, tag_id: 36 }, { post_id: 11, tag_id: 37 },
  // Post 12
  { post_id: 12, tag_id: 22 }, { post_id: 12, tag_id: 14 }, { post_id: 12, tag_id: 38 }, { post_id: 12, tag_id: 39 }
];

module.exports = {
  staticCategories,
  seedUsers,
  seedPosts,
  seedTags,
  seedPostTags
};
