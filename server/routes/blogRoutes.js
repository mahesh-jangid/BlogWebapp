const express = require('express');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getAuthorBlogs,
  incrementView,
} = require('../controllers/blogController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Public routes - view blogs
// Important: More specific routes must come before wildcard :id route
router.get('/', getAllBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/author/:authorId', getAuthorBlogs);
router.post('/:id/view', incrementView); // Track views (no auth required for guests)
router.get('/:id', getBlogById);

// Protected routes - create/modify blogs (requires authentication)
router.post('/', auth, roleCheck(['author', 'admin']), createBlog);
router.put('/:id', auth, roleCheck(['author', 'admin']), updateBlog);
router.delete('/:id', auth, roleCheck(['author', 'admin']), deleteBlog);

module.exports = router;
