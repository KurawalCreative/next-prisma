"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Post {
  id: string;
  title: string;
  content: string;
  createAt: string;
  updatedAt: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("/api/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPost = async () => {
    if (!title || !content) return;
    setIsAdding(true);
    try {
      await axios.post("/api/posts", { title, content });
      setTitle("");
      setContent("");
      fetchPosts();
    } catch (error) {
      console.error("Failed to add post:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const deletePost = async (id: string) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/posts/${id}`);
      fetchPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const saveEdit = async () => {
    if (!editingId || !editTitle || !editContent) return;
    setIsSaving(true);
    try {
      await axios.put(`/api/posts/${editingId}`, {
        title: editTitle,
        content: editContent,
      });
      setEditingId(null);
      setEditTitle("");
      setEditContent("");
      fetchPosts();
    } catch (error) {
      console.error("Failed to update post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Simple CRUD Posts</h1>

      {/* Add Post Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Post</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full mb-2 p-2 border border-gray-300 rounded"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="block w-full mb-2 p-2 border border-gray-300 rounded"
          rows={4}
        />
        <button
          onClick={addPost}
          disabled={isAdding}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isAdding ? "Adding..." : "Add Post"}
        </button>
      </div>

      {/* Posts List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-4 mb-4 rounded shadow">
              {editingId === post.id ? (
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={isSaving}
                    className="block w-full mb-2 p-2 border border-gray-300 rounded disabled:opacity-50"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={isSaving}
                    className="block w-full mb-2 p-2 border border-gray-300 rounded disabled:opacity-50"
                    rows={4}
                  />
                  <button
                    onClick={saveEdit}
                    disabled={isSaving}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={isSaving}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold">{post.title}</h3>
                  <p className="mb-4">{post.content}</p>
                  <button
                    onClick={() => startEdit(post)}
                    disabled={deletingId === post.id}
                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={deletingId === post.id}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {deletingId === post.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
