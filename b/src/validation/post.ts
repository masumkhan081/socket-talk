import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string()
    .min(1, 'Post content is required')
    .max(500, 'Post content must be less than 500 words')
    .refine((content) => {
      const wordCount = content.trim().split(/\s+/).length;
      return wordCount <= 500;
    }, {
      message: 'Post content must be less than 500 words'
    })
});

export const updatePostSchema = z.object({
  content: z.string()
    .min(1, 'Post content is required')
    .max(500, 'Post content must be less than 500 words')
    .refine((content) => {
      const wordCount = content.trim().split(/\s+/).length;
      return wordCount <= 500;
    }, {
      message: 'Post content must be less than 500 words'
    })
});

export const createCommentSchema = z.object({
  postId: z.string()
    .min(1, 'Post ID is required'),
  content: z.string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment must be less than 1000 characters'),
  parentCommentId: z.string()
    .optional()
});

export const updateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment must be less than 1000 characters')
});

export const likePostSchema = z.object({
  postId: z.string()
    .min(1, 'Post ID is required')
});

export const dislikePostSchema = z.object({
  postId: z.string()
    .min(1, 'Post ID is required')
});

export const likeCommentSchema = z.object({
  commentId: z.string()
    .min(1, 'Comment ID is required')
});

export const dislikeCommentSchema = z.object({
  commentId: z.string()
    .min(1, 'Comment ID is required')
});

export const getPostsSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine((page) => page > 0, 'Page must be greater than 0')
    .optional()
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine((limit) => limit > 0 && limit <= 50, 'Limit must be between 1 and 50')
    .optional()
    .default('10')
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type LikePostInput = z.infer<typeof likePostSchema>;
export type DislikePostInput = z.infer<typeof dislikePostSchema>;
export type LikeCommentInput = z.infer<typeof likeCommentSchema>;
export type DislikeCommentInput = z.infer<typeof dislikeCommentSchema>;
export type GetPostsInput = z.infer<typeof getPostsSchema>;
