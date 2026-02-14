const Like = require('../models/Like');
const Blog = require('../models/Blog');

// @desc    Like/Unlike a blog
// @route   POST /api/likes
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const { blogId } = req.body;

    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: 'Blog ID is required',
      });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const userId = req.user.id;

    // Check if user already liked
    let like = await Like.findOne({ user: userId, blog: blogId });

    if (like) {
      // Unlike
      await Like.findByIdAndDelete(like._id);
      blog.likes = blog.likes.filter(id => id.toString() !== userId);
      blog.likeCount = Math.max(0, blog.likeCount - 1);
      await blog.save();

      res.status(200).json({
        success: true,
        message: 'Like removed',
        liked: false,
        likeCount: blog.likeCount,
      });
    } else {
      // Like
      const newLike = new Like({
        user: userId,
        blog: blogId,
      });

      await newLike.save();
      blog.likes.push(userId);
      blog.likeCount = (blog.likeCount || 0) + 1;
      await blog.save();

      res.status(201).json({
        success: true,
        message: 'Blog liked',
        liked: true,
        likeCount: blog.likeCount,
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate like attempt
      const blog = await Blog.findById(req.body.blogId);
      const isLiked = blog.likes.includes(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Already liked',
        liked: isLiked,
        likeCount: blog.likeCount,
      });
    } else {
      next(error);
    }
  }
};

// @desc    Check if user liked a blog
// @route   GET /api/likes/:blogId
// @access  Private
exports.checkLike = async (req, res, next) => {
  try {
    const like = await Like.findOne({
      user: req.user.id,
      blog: req.params.blogId,
    });

    res.status(200).json({
      success: true,
      liked: !!like,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get likes count for a blog
// @route   GET /api/likes/count/:blogId
// @access  Public
exports.getLikeCount = async (req, res, next) => {
  try {
    const count = await Like.countDocuments({ blog: req.params.blogId });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};
