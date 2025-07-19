import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  dislikePost,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment
} from '../controllers/postController';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateCommentSchema,
  likePostSchema,
  dislikePostSchema,
  likeCommentSchema,
  dislikeCommentSchema,
  getPostsSchema
} from '../validation/post';

const router = Router();

// All post routes require authentication and email verification
router.use(authenticateToken, requireEmailVerification);

// Post routes
router.get('/', validateQuery(getPostsSchema), getPosts as any);
router.post('/', validateRequest(createPostSchema), createPost);
router.get('/:postId', getPost);
router.patch('/:postId', validateRequest(updatePostSchema), updatePost);
router.delete('/:postId', deletePost);

// Post interaction routes
router.post('/like', validateRequest(likePostSchema), likePost);
router.post('/dislike', validateRequest(dislikePostSchema), dislikePost);

// Comment routes
router.post('/comments', validateRequest(createCommentSchema), createComment);
router.patch('/comments/:commentId', validateRequest(updateCommentSchema), updateComment);
router.delete('/comments/:commentId', deleteComment);

// Comment interaction routes
router.post('/comments/like', validateRequest(likeCommentSchema), likeComment);
router.post('/comments/dislike', validateRequest(dislikeCommentSchema), dislikeComment);

export default router;
