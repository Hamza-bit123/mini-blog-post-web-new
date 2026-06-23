import React, { useState } from "react";
import "./createPost.css";
import * as Icon from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";
import Popup from "../../components/popup";
import { useEffect } from "react";
import { fetchWithAuth } from "../../api/api";

function CreatePost() {
  const { id } = useParams();

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    tag: "",
    content: "",
  });
  const [message, setMessage] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tags = formData.tag && formData.tag.split(",");

    const formdata = new FormData();
    formdata.append("title", formData.title);
    formdata.append("category_id", formData.category);
    tags.forEach((tag) => formdata.append("tags", tag));
    image && formdata.append("image", image);
    formdata.append("content", formData.content);

    const url = id
      ? `${import.meta.env.VITE_BACKEND_URL}/api/posts/${id}`
      : "${import.meta.env.VITE_BACKEND_URL}/api/posts/create";
    const method = id ? "PATCH" : "POST";

    let response = await fetchWithAuth(url, {
      method: method,
      body: formdata,
    });

    const data = await response.json();
    if (data.success) {
      setMessage({ value: data.message, type: "success" });
      setTimeout(() => {
        navigate("/posts/me");
      }, 1000);
    } else {
      setMessage({ value: data.error, type: "error" });
      setTimeout(() => {
        setMessage(null);
        if (response.status === 404) navigate("/posts/me");
      }, 1000);
    }
  };

  const handlChange = (e) => {
    let { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${id}`,
        { method: "GET" },
      );

      const data = await response.json();
      if (data.success) {
        setFormData({
          title: data.data.title,
          content: data.data.content,
          category: data.data.category_id,
          tag: data.data?.tags.toString(),
        });
        setPreview(
          `${import.meta.env.VITE_BACKEND_URL}/uploads/${data.data.image}`,
        );
      }
    };

    fetchData();
  }, [id]);
  return (
    <div className="flex_vertical--container">
      <div
        className="back--btn"
        onClick={() => {
          navigate(-1);
        }}
      >
        <Icon.ArrowLeftSquareFill />
        <span>Back</span>
      </div>

      <h3 className="container--title">
        {id ? "Edit Post" : "Write a New Post"}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="input_wrapper">
          <label htmlFor="title">post Title</label>
          <input
            type="text"
            name="title"
            placeholder="Enter post title"
            id="title"
            value={formData.title}
            onChange={handlChange}
            required
          />
        </div>
        <div className="input_wrapper">
          <label htmlFor="category">Category</label>
          <select
            name="category"
            id="category"
            value={formData.category}
            onChange={handlChange}
            required
          >
            <option value="">Select Category</option>
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
        </div>
        <div className="input_wrapper">
          <label htmlFor="tag">Tags</label>
          <input
            type="text"
            name="tag"
            id="tag"
            value={formData.tag}
            onChange={handlChange}
            placeholder="Enter tags separated by comma"
            required
          />
          <div className="tags">
            <span>#javascript</span>
            <span>#website</span>
            <span>#tutorial</span>
          </div>
        </div>
        <div className="input_wrapper">
          <label htmlFor="">Post Image</label>
          <label htmlFor="postImage" className="imageSelector">
            {preview ? (
              <img src={preview} alt="preview" width="300px" />
            ) : (
              <div>
                <Icon.CardImage size={60} />
                <p>Upload image Drag & Drop or choose file</p>
              </div>
            )}
          </label>
          <input
            type="file"
            name="image"
            id="postImage"
            accept="jpeg,jpg, png, webp"
            onChange={handleImage}
          />
          {image && <span className="url">file: {image.name}</span>}
        </div>
        <div className="input_wrapper">
          <label htmlFor="content">Content</label>
          <textarea
            name="content"
            id="content"
            placeholder="Write yoour article here ..."
            rows={15}
            value={formData.content}
            onChange={handlChange}
            required
          ></textarea>
        </div>
        <div className="form__buttons">
          <button type="submit">{id ? "Edit Post" : "Publish Post"}</button>
        </div>
      </form>
      {message && <Popup message={message} />}
    </div>
  );
}

export default CreatePost;
