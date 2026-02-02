import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBlogs, deleteBlog } from '../services/api';

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await getBlogs();
      setBlogs(response.data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog? This will also delete all associated images.')) {
      return;
    }

    try {
      await deleteBlog(id);
      setBlogs(blogs.filter((blog) => blog._id !== id));
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('Failed to delete blog');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Blog Dashboard</h1>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/editor')}>
              + New Blog
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {blogs.length === 0 ? (
          <div className="empty-state">
            <h3>No blogs yet</h3>
            <p>Create your first blog post to get started.</p>
          </div>
        ) : (
          <div className="blog-list">
            {blogs.map((blog) => (
              <div key={blog._id} className="blog-card">
                <div className="blog-info">
                  <h3>{blog.title}</h3>
                  <p>/{blog.slug}</p>
                  <div className="blog-meta">
                    <span className={`status-badge ${blog.published ? 'status-published' : 'status-draft'}`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                    <span>Created: {formatDate(blog.createdAt)}</span>
                    {blog.tags?.length > 0 && (
                      <span>Tags: {blog.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="blog-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/editor/${blog._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(blog._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
