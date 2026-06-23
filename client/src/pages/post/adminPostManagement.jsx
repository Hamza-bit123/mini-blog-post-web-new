import React, { useEffect, useRef, useState } from "react";
import * as Icon from "react-bootstrap-icons";
import { fetchWithAuth } from "../../api/api";
import { useNavigate } from "react-router-dom";
import Popup from "../../components/popup";
import "./adminPostManagement.css";

function AdminPostManagement() {
  const [posts, setPosts] = useState(null);
  const [menu, setMenu] = useState(null);
  // const [filter, setFilter] = useState({ categories: 0, search: "" });
  const navigate = useNavigate();
  const dialogRef = useRef();
  const [postId, setPostId] = useState(0);
  const [message, setMessage] = useState({ value: "", type: "" });

  const menuRef = useRef(null);
  const moreBtnRef = useRef(null);

  const handleUnshowDialog = () => {
    dialogRef.current.close();
  };

  const handleDeletePost = async (e) => {
    e.preventDefault();

    const response = await fetchWithAuth(
      `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}`,
      { method: "DELETE" },
    );

    const data = await response.json();
    dialogRef.current.close();
    if (data.success) {
      setMessage({ value: data.message, type: "success" });
      dialogRef.current.close();
      setTimeout(() => {
        navigate("/posts/me");
      }, 1000);
    } else {
      setMessage({ value: data.error, type: "error" });
      setTimeout(() => {
        setMessage(null);
      }, 2000);
    }
  };
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFilter((prev) => ({ ...prev, [name]: value }));
  // };
  const handleClick = (id) => {
    setMenu((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    function hideMenu() {
      setMenu(null);
    }
    function handleMouseDownOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !moreBtnRef.current.contains(e.target)
      )
        setMenu(null);
    }
    document.addEventListener("scroll", hideMenu);
    document.addEventListener("mousedown", handleMouseDownOutside);

    // fetching data from server
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

    return () => {
      document.removeEventListener("scroll", hideMenu);
      document.removeEventListener("mousedown", handleMouseDownOutside);
    };
  }, []);
  return (
    <section className="manage-posts--section">
      <div className="section--header">
        <h3 className="section--title">Manage Posts</h3>
        {/* <button type="button" className="btn createPost--btn">
          <Icon.Plus size={20} /> Create Post
        </button> */}
      </div>
      {/* <div className="section--header">
        <select
          name="categories"
          value={filter.categories}
          onChange={handleChange}
        >
          <option value={0}>All Categories</option>
          <option value={10}>Software Architecture</option>
          <option value={9}>Programming Tips</option>
          <option value={8}>DevOps</option>
          <option value={7}>React</option>
          <option value={6}>Node.js</option>
          <option value={5}>JavaScript</option>
          <option value={4}>Database</option>
          <option value={3}>Frontend</option>
          <option value={2}>Backend</option>
          <option value={1}>Web Development</option>
        </select>
        <input
          type="search"
          name="search"
          id="search"
          placeholder="Search posts"
          value={filter.search}
          onChange={handleChange}
        />
      </div> */}
      {posts && (
        <table className="posts--table">
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post.id}>
                <td>{index + 1}</td>
                <td
                  onClick={() => {
                    alert(post.id);
                  }}
                >
                  {post.title}
                </td>
                <td>{post.author}</td>
                <td>
                  {`${new Date(post.created_at).toLocaleDateString("en-US", {
                    month: "long",
                  })}, ${new Date(post.created_at).toLocaleDateString("en-US", {
                    day: "2-digit",
                  })}`}
                </td>
                <td>
                  {menu === index && (
                    <div className="action--menu" ref={menuRef}>
                      <div
                        onClick={() => {
                          navigate(`/posts/${post.id}`);
                        }}
                      >
                        <Icon.EyeSlash /> View
                      </div>
                      <div
                        onClick={() => {
                          dialogRef.current.showModal();
                        }}
                      >
                        <Icon.Trash /> Delete
                      </div>
                    </div>
                  )}

                  <Icon.ThreeDots
                    className={menu === index ? "more-btn active" : "more-btn"}
                    onClick={() => {
                      setPostId(post.id);
                      handleClick(index);
                    }}
                    ref={moreBtnRef}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <dialog className="delete--post-dialog" ref={dialogRef}>
        <form action="dialog" onSubmit={handleDeletePost}>
          <span>are your sure you want to delete this post?</span>
          <div className="buttons">
            <button
              type="button"
              className="cancel"
              onClick={handleUnshowDialog}
            >
              Cancel
            </button>
            <button type="button" className="no" onClick={handleUnshowDialog}>
              No
            </button>
            <button type="submit" className="yes">
              Yes
            </button>
          </div>
        </form>
      </dialog>
      {message.value && <Popup message={message} />}
    </section>
  );
}

export default AdminPostManagement;
