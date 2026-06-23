import React, { useEffect, useState } from "react";
import * as Icon from "react-bootstrap-icons";
import "./adminDashboard.css";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../api/api";
import UserDashboard from "./userDashboard";

function AdminDashboard() {
  const [type, setType] = useState("admin");
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_BACKEND_URL}/api/dashboard/admin`,
        {
          method: "GET",
        },
      );
      const data = await response.json();
      if (data.success) {
        setData(data.data);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="dashboard--wrapper">
      <h3>Dashboard</h3>
      <section>
        <div className="admin--dashboard--menu">
          <button
            type="button"
            className={type === "admin" ? "active" : ""}
            onClick={() => {
              setType("admin");
            }}
          >
            <Icon.BarChart />
            Platform Overview
          </button>
          <button
            type="button"
            className={type === "user" ? "active" : ""}
            onClick={() => {
              setType("user");
            }}
          >
            <Icon.Person />
            Personal Dashboard
          </button>
        </div>
        {type === "admin" ? (
          <section className="dashboard-content">
            <section className="welcome--section">
              <h2 className="welcome--title">
                Welcome back {`, ${data?.user?.username}`}
              </h2>
              <p className="welcome--description">
                here's what is happning with MiniBlog blog platform.
              </p>
            </section>
            <section className="stats--grid">
              <div className="stat--card">
                <span className="stat--label">
                  Total Users
                  <Icon.Signpost2Fill />
                </span>
                <span className="stat--value">
                  {data?.stats?.totalUsers || 0}
                </span>
              </div>
              <div className="stat--card">
                <span className="stat--label">
                  Total Posts
                  <Icon.Signpost2Fill />
                </span>
                <span className="stat--value">
                  {data?.stats?.totalPosts || 0}
                </span>
              </div>
              <div className="stat--card">
                <span className="stat--label">
                  Categories <Icon.DistributeHorizontal />
                </span>
                <span className="stat--value">
                  {data?.stats?.totalCategories || 0}
                </span>
              </div>
              <div className="stat--card">
                <span className="stat--label">
                  Total Tags
                  <Icon.TagsFill />
                </span>
                <span className="stat--value">
                  {data?.stats?.totalTags || 0}
                </span>
              </div>
            </section>
            <section className="chart--section">
              <div className="chart--card">
                <h3 className="chart--title">Top Categories</h3>
                <div className="chart">
                  <div className="chart--info">
                    <span>{data?.topCategories[0]?.name || "category"}</span>
                    <span>
                      {`${
                        Math.ceil(
                          (data?.topCategories[0]?.post_count * 100) /
                            data?.stats.totalCategories,
                        ) || 0
                      }%`}
                    </span>
                  </div>
                  <div className="chart--bar">
                    <div
                      className="active--top"
                      style={{
                        width: `${
                          (data?.topCategories[0]?.post_count * 100) /
                            data?.stats?.totalCategories || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="chart">
                  <div className="chart--info">
                    <span>{data?.topCategories[1]?.name || "category"}</span>
                    <span>{`${
                      Math.ceil(
                        (data?.topCategories[1]?.post_count * 100) /
                          data?.stats.totalCategories,
                      ) || 0
                    }%`}</span>
                  </div>
                  <div className="chart--bar">
                    <div
                      className="active--middle"
                      style={{
                        width: `${
                          (data?.topCategories[1]?.post_count * 100) /
                            data?.stats.totalCategories || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="chart">
                  <div className="chart--info">
                    <span>{data?.topCategories[2]?.name || "category"}</span>
                    <span>{`${
                      Math.ceil(
                        (data?.topCategories[2]?.post_count * 100) /
                          data?.stats.totalCategories,
                      ) || 0
                    }%`}</span>
                  </div>
                  <div className="chart--bar">
                    <div
                      className="active--bottom"
                      style={{
                        width: `${
                          (data?.topCategories[2]?.post_count * 100) /
                            data?.stats.totalCategories || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </section>
            <section className="recent--users">
              <h3>Recent Users</h3>
              <table className="users--table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentUsers?.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>Active</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            {data && (
              <ul className="recent--posts">
                <h3>Recent Posts</h3>
                {data.recentPosts?.map((post) => (
                  <li
                    className="post_item"
                    key={post.id}
                    onClick={() => {
                      navigate(`/posts/${post.id}`);
                    }}
                  >
                    <div className="post--image_preview">
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${post.image}`}
                        alt={post.title}
                      />
                    </div>
                    <div className="post--details">
                      <h4 className="post--details__title">{post.title}</h4>
                      <div className="post--details__meta">
                        <span className="category">{post.category}</span>
                        <span className="date">
                          {" "}
                          {`| ${new Date(post.created_at).toLocaleDateString("en-UK", { month: "long" })}
                        ${new Date(post.created_at).toLocaleDateString("en-UK", { day: "2-digit" })},
                        ${new Date(post.created_at).toLocaleDateString("en-UK", { year: "numeric" })}`}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <UserDashboard />
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
