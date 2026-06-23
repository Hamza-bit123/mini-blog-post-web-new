import React, { useState, useEffect } from "react";
import Posts from "../../components/posts";
import { fetchWithAuth } from "../../api/api";

function GetMyPosts() {
  const [posts, setPosts] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/me`,
        { method: "GET" },
      );

      const data = await response.json();
      setPosts(data.data);
    };

    fetchData();
  }, []);

  return (
    <div className="posts-page">
      <h3 className="section--title">My Posts</h3>
      <p className="section--description">
        Manage and explore all the posts you've created in MiniBlog.
      </p>
      <Posts props={{ posts: posts, type: "me" }} />
    </div>
  );
}

export default GetMyPosts;
