import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./getPost.css";
import { ArrowLeftSquareFill, Share } from "react-bootstrap-icons";
import { fetchWithAuth } from "../../api/api";
import { UserContext } from "../../context/userContext";
import * as Icon from "react-bootstrap-icons";
import Popup from "../../components/popup";

function GetPost() {
  const [post, setPost] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const dialogRef = useRef(null);
  const [message, setMessage] = useState(null);

  const handleClick = () => {
    dialogRef.current.showModal();
  };

  const handleDeletePost = async (e) => {
    e.preventDefault();

    const response = await fetchWithAuth(
      `${import.meta.env.VITE_BACKEND_URL}/api/posts/${id}`,
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

  const handleUnshowDialog = () => {
    dialogRef.current.close();
  };
  useEffect(() => {
    const fechData = async () => {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${id}`,
        { method: "GET" },
      );
      const data = await response.json();
      if (data.success) {
        setPost(data.data);
      } else {
        alert(data.error);
        navigate("/posts");
      }
    };

    fechData();
  }, [id, navigate]);
  return (
    post && (
      <div className="post-container">
        <div className="back--btn">
          <ArrowLeftSquareFill
            onClick={() => {
              navigate(-1);
            }}
          />
          <span>Back</span>
        </div>
        <h1 className="post-title">{post.title}</h1>
        <div className="meta">{`By ${post.author} . ${new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}</div>
        <div className="category">{post.category}</div>
        {post.image && (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${post.image}`}
            alt={post.title}
          />
        )}
        <div className="content">{post.content}</div>
        <div className="tags">
          {post.tags.map((tag) => (
            <div className="tag" key={tag}>
              {tag}
            </div>
          ))}
        </div>
        {(user?.id === post.author_id || user.role === "admin") && (
          <div className="actions-buttons">
            <button
              type="button"
              className="edit--btn"
              onClick={() => {
                navigate(`/posts/create/${post.id}`);
              }}
            >
              <Icon.VectorPen />
              Edit
            </button>
            <button type="button" className="delete--btn" onClick={handleClick}>
              <Icon.Trash3Fill />
              Delete
            </button>
          </div>
        )}
        <div className="share">
          <Share />
          <button>facebook</button>
          <button>twitter</button>
          <button>linkedin</button>
        </div>

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
        {message && <Popup message={message} />}
      </div>
    )
  );
}

export default GetPost;
