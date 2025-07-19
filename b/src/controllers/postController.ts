// abc
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { Notification } from '../models/Notification';
import { ApiResponse, AuthenticatedRequest } from '../types';
import {
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  UpdateCommentInput,
  LikePostInput,
  DislikePostInput,
  LikeCommentInput,
  DislikeCommentInput,
  GetPostsInput
} from '../validation/post';

export const createPost = async (req: AuthenticatedRequest<{}, {}, CreatePostInput>, res: Response) => {
  try {
    const { content } = req.body;

    const post = new Post({
      author: req.userId,
      content
    });

    await post.save();
    await post.populate('author', 'username profileImage');

    const response: ApiResponse = {
      success: true,
      message: 'Post created successfully',
      data: { post }
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Create post error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to create post'
    };

    return res.status(500).json(response);
  }
};

export const getPosts = async (req: AuthenticatedRequest<{}, {}, {}, GetPostsInput>, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username profileImage')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profileImage'
        },
        options: { limit: 3, sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const response: ApiResponse = {
      success: true,
      message: 'Posts retrieved successfully',
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: totalPosts,
          pages: Math.ceil(totalPosts / limit)
        }
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Get posts error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve posts'
    };

    return res.status(500).json(response);
  }
};

export const getPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'username profileImage')
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'author',
            select: 'username profileImage'
          },
          {
            path: 'replies',
            populate: {
              path: 'author',
              select: 'username profileImage'
            }
          }
        ],
        options: { sort: { createdAt: -1 } }
      });

    if (!post) {
      const response: ApiResponse = {
        success: false,
        message: 'Post not found',
        error: 'The requested post does not exist'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Post retrieved successfully',
      data: { post }
    };

    return res.json(response);
  } catch (error) {
    console.error('Get post error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve post'
    };

    return res.status(500).json(response);
  }
};

export const updatePost = async (req: AuthenticatedRequest<{ postId: string }, {}, UpdatePostInput>, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const post = await Post.findOne({
      _id: postId,
      author: req.userId
    });

    if (!post) {
      const response: ApiResponse = {
        success: false,
        message: 'Post not found',
        error: 'You can only update your own posts'
      };
      return res.status(404).json(response);
    }

    post.content = content;
    await post.save();
    await post.populate('author', 'username profileImage');

    const response: ApiResponse = {
      success: true,
      message: 'Post updated successfully',
      data: { post }
    };

    return res.json(response);
  } catch (error) {
    console.error('Update post error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to update post'
    };

    return res.status(500).json(response);
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOne({
      _id: postId,
      author: req.userId
    });

    if (!post) {
      const response: ApiResponse = {
        success: false,
        message: 'Post not found',
        error: 'You can only delete your own posts'
      };
      return res.status(404).json(response);
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ post: postId });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    const response: ApiResponse = {
      success: true,
      message: 'Post deleted successfully'
    };

    return res.json(response);
  } catch (error) {
    console.error('Delete post error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to delete post'
    };

    return res.status(500).json(response);
  }
};

export const likePost = async (req: AuthenticatedRequest<{}, {}, LikePostInput>, res: Response) => {
  try {
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      const response: ApiResponse = {
        success: false,
        message: 'Post not found',
        error: 'The requested post does not exist'
      };
      return res.status(404).json(response);
    }

    const userId = new mongoose.Types.ObjectId(req.userId!);
    const hasLiked = post.likes.includes(userId);
    const hasDisliked = post.dislikes.includes(userId);

    if (hasLiked) {
      // Remove like
      post.likes = post.likes.filter(id => !id.equals(userId));
    } else {
      // Add like and remove dislike if exists
      post.likes.push(userId);
      if (hasDisliked) {
        post.dislikes = post.dislikes.filter(id => !id.equals(userId));
      }

      // Create notification if not own post
      if (!post.author.equals(userId)) {
        const notification = new Notification({
          recipient: post.author,
          sender: req.userId,
          type: 'post_like',
          title: 'Post Liked',
          message: `${req.user?.username} liked your post`,
          relatedId: post._id
        });
        await notification.save();
      }
    }

    await post.save();

    const response: ApiResponse = {
      success: true,
      message: hasLiked ? 'Post unliked successfully' : 'Post liked successfully',
      data: {
        liked: !hasLiked,
        likeCount: post.likes.length,
        dislikeCount: post.dislikes.length
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Like post error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to like post'
    };

    return res.status(500).json(response);
  }
};

export const dislikePost = async (req: AuthenticatedRequest<{}, {}, DislikePostInput>, res: Response) => {
  try {
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      const response: ApiResponse = {
        success: false,
        message: 'Post not found',
        error: 'The requested post does not exist'
      };
      return res.status(404).json(response);
    }

    const userId = new mongoose.Types.ObjectId(req.userId!);
    const hasDisliked = post.dislikes.includes(userId);
    const hasLiked = post.likes.includes(userId);

    if (hasDisliked) {
      // Remove dislike
      post.dislikes = post.dislikes.filter(id => !id.equals(userId));
    } else {
      // Add dislike and remove like if exists
      post.dislikes.push(userId);
      if (hasLiked) {
        post.likes = post.likes.filter(id => !id.equals(userId));
      }
    }

    await post.save();

    const response: ApiResponse = {
      success: true,
      message: hasDisliked ? 'Post undisliked successfully' : 'Post disliked successfully',
      data: {
        disliked: !hasDisliked,
        likeCount: post.likes.length,
        dislikeCount: post.dislikes.length
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Dislike post error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to dislike post'
    };

    return res.status(500).json(response);
  }
};

export const createComment = async (req: AuthenticatedRequest<{}, {}, CreateCommentInput>, res: Response) => {
  try {
    const { postId, content, parentCommentId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      const response: ApiResponse = {
        success: false,
        message: 'Post not found',
        error: 'The requested post does not exist'
      };
      return res.status(404).json(response);
    }

    // If replying to a comment, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        const response: ApiResponse = {
          success: false,
          message: 'Parent comment not found',
          error: 'The comment you are replying to does not exist'
        };
        return res.status(404).json(response);
      }
    }

    const comment = new Comment({
      post: postId,
      author: req.userId,
      content,
      parentComment: parentCommentId || null
    });

    await comment.save();
    await comment.populate('author', 'username profileImage');

    // Add comment to post
    if (!parentCommentId) {
      post.comments.push(comment._id);
      await post.save();
    }

    // Create notification
    const notificationRecipient = parentCommentId 
      ? (await Comment.findById(parentCommentId))?.author
      : post.author;

    if (notificationRecipient && !notificationRecipient.equals(req.userId!)) {
      const notification = new Notification({
        recipient: notificationRecipient,
        sender: req.userId,
        type: parentCommentId ? 'comment_reply' : 'post_comment',
        title: parentCommentId ? 'Comment Reply' : 'New Comment',
        message: parentCommentId 
          ? `${req.user?.username} replied to your comment`
          : `${req.user?.username} commented on your post`,
        relatedId: comment._id
      });
      await notification.save();
    }

    const response: ApiResponse = {
      success: true,
      message: 'Comment created successfully',
      data: { comment }
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Create comment error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to create comment'
    };

    return res.status(500).json(response);
  }
};

export const updateComment = async (req: AuthenticatedRequest<{ commentId: string }, {}, UpdateCommentInput>, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.userId
    });

    if (!comment) {
      const response: ApiResponse = {
        success: false,
        message: 'Comment not found',
        error: 'You can only update your own comments'
      };
      return res.status(404).json(response);
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'username profileImage');

    const response: ApiResponse = {
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    };

    return res.json(response);
  } catch (error) {
    console.error('Update comment error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to update comment'
    };

    return res.status(500).json(response);
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.userId
    });

    if (!comment) {
      const response: ApiResponse = {
        success: false,
        message: 'Comment not found',
        error: 'You can only delete your own comments'
      };
      return res.status(404).json(response);
    }

    // Remove comment from post if it's a top-level comment
    if (!comment.parentComment) {
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: comment._id }
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: commentId });

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    const response: ApiResponse = {
      success: true,
      message: 'Comment deleted successfully'
    };

    return res.json(response);
  } catch (error) {
    console.error('Delete comment error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to delete comment'
    };

    return res.status(500).json(response);
  }
};

export const likeComment = async (req: AuthenticatedRequest<{}, {}, LikeCommentInput>, res: Response) => {
  try {
    const { commentId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      const response: ApiResponse = {
        success: false,
        message: 'Comment not found',
        error: 'The requested comment does not exist'
      };
      return res.status(404).json(response);
    }

    const userId = new mongoose.Types.ObjectId(req.userId!);
    const hasLiked = comment.likes.includes(userId);
    const hasDisliked = comment.dislikes.includes(userId);

    if (hasLiked) {
      // Remove like
      comment.likes = comment.likes.filter(id => !id.equals(userId));
    } else {
      // Add like and remove dislike if exists
      comment.likes.push(userId);
      if (hasDisliked) {
        comment.dislikes = comment.dislikes.filter(id => !id.equals(userId));
      }
    }

    await comment.save();

    const response: ApiResponse = {
      success: true,
      message: hasLiked ? 'Comment unliked successfully' : 'Comment liked successfully',
      data: {
        liked: !hasLiked,
        likeCount: comment.likes.length,
        dislikeCount: comment.dislikes.length
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Like comment error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to like comment'
    };

    return res.status(500).json(response);
  }
};

export const dislikeComment = async (req: AuthenticatedRequest<{}, {}, DislikeCommentInput>, res: Response) => {
  try {
    const { commentId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      const response: ApiResponse = {
        success: false,
        message: 'Comment not found',
        error: 'The requested comment does not exist'
      };
      return res.status(404).json(response);
    }

    const userId = new mongoose.Types.ObjectId(req.userId!);
    const hasDisliked = comment.dislikes.includes(userId);
    const hasLiked = comment.likes.includes(userId);

    if (hasDisliked) {
      // Remove dislike
      comment.dislikes = comment.dislikes.filter(id => !id.equals(userId));
    } else {
      // Add dislike and remove like if exists
      comment.dislikes.push(userId);
      if (hasLiked) {
        comment.likes = comment.likes.filter(id => !id.equals(userId));
      }
    }

    await comment.save();

    const response: ApiResponse = {
      success: true,
      message: hasDisliked ? 'Comment undisliked successfully' : 'Comment disliked successfully',
      data: {
        disliked: !hasDisliked,
        likeCount: comment.likes.length,
        dislikeCount: comment.dislikes.length
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Dislike comment error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to dislike comment'
    };

    return res.status(500).json(response);
  }
};
