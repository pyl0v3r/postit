import { getUserFromToken } from './utils/auth';
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { fetchPosts, createPost, updatePost, deletePost, createComment, deleteComment } from './api';
import Login from './Login';
import Register from './Register';
import DOMPurify from 'dompurify';

function App() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const navigate = useNavigate();

  const loadCurrentUser = async () => {
    const user = await getUserFromToken(token);
    setCurrentUser(user);
  }
  const loadPosts = async () => {
    const data = await fetchPosts();
    setPosts(data);
  };

  useEffect(() => {
    if (token) {
      loadCurrentUser();
    } else {
      setCurrentUser(null);
    }
    loadPosts();
  }, [token]);

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <Link to="/">Home</Link>
          {currentUser && currentUser.user && currentUser.user.username ? <p>Hello, {currentUser.user.username}</p> : ''}
        </div>
        <div>
          {token ? (
            <button className="secondary" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login"><button className="primary">Login</button></Link>
              <Link to="/register"><button className="primary">Register</button></Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register setToken={setToken} />} />
        <Route
          path="/"
          element={
            <Home
              posts={posts}
              newPost={newPost}
              setNewPost={setNewPost}
              loadPosts={loadPosts}
              token={token}
              currentUser={currentUser}
            />
          }
        />

      </Routes>
    </div>
  );
}

function Home({ posts, newPost, setNewPost, loadPosts, token, currentUser }) {
  const handleCreatePost = async () => {
    await createPost(newPost, token);
    setNewPost({ title: '', content: '' });
    loadPosts();
  };

  return (
    <>
      {token && (
        <div className="card">
          <h2>Create Post</h2>
          <input
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <textarea
            placeholder="Content"
            rows="3"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
          <button className="primary" onClick={handleCreatePost}>
            Publish
          </button>
        </div>
      )}

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          refresh={loadPosts}
          token={token}
          currentUser={currentUser}
        />))}
    </>
  );
}

function PostCard({ post, refresh, token, currentUser }) {
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [comment, setComment] = useState('');
  const isPostOwner =
    currentUser && post.author && post.author._id === currentUser.userId;

  const save = async () => {
    await updatePost(post._id, { title, content }, token);
    setEdit(false);
    refresh();
  };

  const addComment = async () => {
    await createComment(post._id, comment, token);
    setComment('');
    refresh();
  };

  return (
    <div className="card">
      {edit ? (
        <>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea rows="3" value={content} onChange={(e) => setContent(e.target.value)} />
        </>
      ) : (
        <>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </>
      )}

      {token && isPostOwner && (
        <div className="actions">
          <button className="secondary" onClick={() => setEdit(!edit)}>
            {edit ? 'Cancel' : 'Edit'}
          </button>

          {edit && (
            <button className="primary" onClick={save}>
              Save
            </button>
          )}

          <button
            className="danger"
            onClick={() => deletePost(post._id, token).then(refresh)}
          >
            Delete
          </button>
        </div>
      )}


      <div className="comments">
        <h4>Comments</h4>
        {post.comments?.map((c) => {
          const isCommentOwner =
            currentUser && c.author && c.author._id === currentUser.userId;
          return (
            <div key={c._id} className="comment">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(c.content)
                }}
              />

              {token && isCommentOwner && (
                <button
                  className="danger small"
                  onClick={() => deleteComment(c._id, token).then(refresh)}
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}

        {token && (
          <>
            <input
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="primary" onClick={addComment}>Comment</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
