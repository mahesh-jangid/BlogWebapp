const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private (Author, Admin)
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, category, featuredImage, tags, excerpt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    // Generate slug manually to ensure it's created
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const blog = new Blog({
      title,
      content,
      category,
      featuredImage,
      tags: tags || [],
      excerpt,
      author: req.user.id,
      slug, // Explicitly set slug
    });

    await blog.save();
    await blog.populate('author', 'username email firstName lastName profileImage');
    await blog.populate('category', 'name slug');

    console.log('✅ Blog created with slug:', blog.slug);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog,
    });
  } catch (error) {
    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(400).json({
        success: false,
        message: 'A blog with this title already exists. Please use a different title.',
      });
    }
    next(error);
  }
};

// @desc    Get all blogs with filtering and pagination
// @route   GET /api/blogs
// @access  Public
exports.getAllBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, author, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { published: true };

    if (category) query.category = category;
    if (author) query.author = author;
    
    // Improved search with regex (case-insensitive)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username email firstName lastName profileImage')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    // If user is authenticated, include their like status for each blog
    let blogsWithLikeStatus = blogs;
    if (req.user?.id) {
      const Like = require('../models/Like');
      const userId = req.user.id;
      const likedBlogIds = await Like.find({ user: userId, blog: { $in: blogs.map(b => b._id) } }).select('blog');
      const likedSet = new Set(likedBlogIds.map(l => l.blog.toString()));
      
      blogsWithLikeStatus = blogs.map(blog => ({
        ...blog.toObject(),
        isLikedByUser: likedSet.has(blog._id.toString())
      }));
    }

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      blogs: blogsWithLikeStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by ID or slug
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('🔍 getBlogById called with id:', id);
    
    // Check if the id is a valid MongoDB ObjectId
    let blog;
    const isObjectId = mongoose.isValidObjectId(id);
    console.log('📊 Is valid ObjectId:', isObjectId);
    
    if (isObjectId) {
      // If it's a valid ObjectId, find by ID
      console.log('🔎 Searching by ObjectId...');
      blog = await Blog.findById(id)
        .populate('author', 'username email firstName lastName profileImage bio')
        .populate('category', 'name slug');
    } else {
      // If it's not a valid ObjectId, treat it as a slug
      console.log('🔎 Searching by slug:', id);
      blog = await Blog.findOne({ slug: id })
        .populate('author', 'username email firstName lastName profileImage bio')
        .populate('category', 'name slug');
      
      if (!blog) {
        console.log('❌ Blog not found with slug, trying alternative searches...');
        // Try URL decoded version if it was encoded
        const decodedSlug = decodeURIComponent(id);
        if (decodedSlug !== id) {
          blog = await Blog.findOne({ slug: decodedSlug })
            .populate('author', 'username email firstName lastName profileImage bio')
            .populate('category', 'name slug');
        }
      }
    }

    if (!blog) {
      console.log('❌ Blog not found');
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    console.log('✅ Blog found:', blog._id, 'slug:', blog.slug);

    // Get comments using the blog's actual _id
    const comments = await Comment.find({ blog: blog._id })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      blog,
      comments,
    });
  } catch (error) {
    console.error('💥 Error in getBlogById:', error);
    next(error);
  }
};

// @desc    Get blog by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'username email firstName lastName profileImage bio')
      .populate('category', 'name slug');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const comments = await Comment.find({ blog: blog._id })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      blog,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Author of blog, Admin)
exports.updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this blog',
      });
    }

    const { title, content, category, featuredImage, tags, excerpt, published } = req.body;

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (featuredImage) blog.featuredImage = featuredImage;
    if (tags) blog.tags = tags;
    if (excerpt) blog.excerpt = excerpt;
    if (published !== undefined) blog.published = published;

    await blog.save();
    await blog.populate('author', 'username email firstName lastName profileImage');
    await blog.populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      blog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Author of blog, Admin)
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this blog',
      });
    }

    // Delete associated comments and likes
    await Comment.deleteMany({ blog: req.params.id });
    await Like.deleteMany({ blog: req.params.id });

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's blogs
// @route   GET /api/blogs/author/:authorId
// @access  Public
exports.getAuthorBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ author: req.params.authorId, published: true })
      .populate('author', 'username email firstName lastName profileImage')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments({ author: req.params.authorId, published: true });

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment blog view count (one per user)
// @route   POST /api/blogs/:id/view
// @access  Public
exports.incrementView = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Get user ID if authenticated, otherwise use IP address or client fingerprint
    const viewerId = req.user?.id || `guest-${req.ip}`;

    // Check if this user/guest has already viewed this blog
    const hasViewed = blog.viewers.some(
      (viewer) => viewer.toString() === viewerId
    );

    // If not viewed, add to viewers array and increment count
    if (!hasViewed && req.user?.id) {
      blog.viewers.push(req.user.id);
      blog.viewCount = (blog.viewCount || 0) + 1;
      await blog.save();
    } else if (!hasViewed && !req.user?.id) {
      // For guests, we'll allow one view per session/IP
      blog.viewers.push(viewerId);
      blog.viewCount = (blog.viewCount || 0) + 1;
      await blog.save();
    }

    res.status(200).json({
      success: true,
      message: 'View recorded',
      viewCount: blog.viewCount,
    });
  } catch (error) {
    next(error);
  }
};
