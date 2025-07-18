// src/services/endpoints.ts
const API_ENDPOINTS = {
   AUTH: {
     LOGIN: '/auth/login',
     REGISTER: '/auth/register',
     ME: '/auth/me',
     LOGOUT: '/auth/logout',
     REFRESH: '/auth/refresh',
   },
   USERS: {
     BASE: '/users',
     PROFILE: '/users/profile',
     AVATAR: '/users/avatar',
   },
   CHAT: {
     CONVERSATIONS: '/chat/conversations',
     MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
     SEND_MESSAGE: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
   },
   GROUPS: {
     BASE: '/groups',
     MEMBERS: (groupId: string) => `/groups/${groupId}/members`,
     INVITES: (groupId: string) => `/groups/${groupId}/invites`,
   },
   POSTS: {
     BASE: '/posts',
     LIKE: (postId: string) => `/posts/${postId}/like`,
     COMMENTS: (postId: string) => `/posts/${postId}/comments`,
   },
 };
 
 export default API_ENDPOINTS;