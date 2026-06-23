import React, { useEffect, useState } from "react";
import "./getPosts.css";
import Posts from "../../components/posts";
import { fetchWithAuth } from "../../api/api";

const GetPosts = () => {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/`,
        {
          method: "GET",
        },
      );
      const data = await response.json();
      setPosts(data.data.posts);
    };

    fetchData();
  }, []);

  return (
    <div className="posts-page">
      <h3 className="section--title">Our Blog</h3>
      <p className="section--description">
        Discover articles, tips, and updates on topics that matter to you.
      </p>
      <Posts props={{ posts: posts, type: "all" }} />
    </div>
  );
};

export default GetPosts;
