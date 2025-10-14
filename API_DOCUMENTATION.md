# API Documentation

Complete reference for all endpoints in the Social Blogging Platform API.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Signup
Register a new user account.

**Endpoint:** `POST /api/auth/signup`

**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "author"  // Optional: "reader" (default), "author", "admin"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64abc123...",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "author"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Login
Authenticate and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64abc123...",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "author"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. Get Current User
Get the profile of the currently authenticated user.

**Endpoint:** `GET /api/auth/me`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64abc123...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "author",
    "bio": "Software developer",
    "avatar": "/uploads/avatar-123.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 👤 User Endpoints

### 1. Get All Users
Retrieve a list of all users with pagination.

**Endpoint:** `GET /api/users`

**Access:** Public

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by role (reader, author, admin)
- `search` (string): Search by username or email

**Example:**
```
GET /api/users?page=1&limit=10&role=author&search=john
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "64abc123...",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "author",
      "avatar": "/uploads/avatar-123.jpg",
      "bio": "Developer"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

### 2. Get User by ID
Get details of a specific user.

**Endpoint:** `GET /api/users/:id`

**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64abc123...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "author",
    "bio": "Software developer",
    "avatar": "/uploads/avatar-123.jpg",
    "followers": [],
    "following": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Update User Profile
Update the authenticated user's profile.

**Endpoint:** `PUT /api/users/:id`

**Access:** Private (Own profile or Admin)

**Request Body:**
```json
{
  "username": "johndoe_updated",
  "bio": "Full-stack developer and tech enthusiast",
  "avatar": "https://example.com/avatar.jpg"
}
```

**With File Upload (multipart/form-data):**
```
username: johndoe_updated
bio: Full-stack developer
avatar: <file>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "64abc123...",
    "username": "johndoe_updated",
    "bio": "Full-stack developer and tech enthusiast",
    "avatar": "/uploads/avatar-456.jpg"
  }
}
```

---

## 📝 Post Endpoints

### 1. Create Post
Create a new blog post.

**Endpoint:** `POST /api/posts`

**Access:** Private (Author or Admin only)

**Request Body (JSON):**
```json
{
  "title": "Getting Started with Node.js",
  "content": "Node.js is a powerful runtime...",
  "tags": ["nodejs", "javascript", "backend"],
  "status": "published"  // "draft", "published", "archived"
}
```

**With Image Upload (multipart/form-data):**
```
title: Getting Started with Node.js
content: Node.js is a powerful runtime...
tags: ["nodejs", "javascript"]
image: <file>
status: published
```

**Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "64def789...",
    "title": "Getting Started with Node.js",
    "content": "Node.js is a powerful runtime...",
    "author": {
      "id": "64abc123...",
      "username": "johndoe",
      "avatar": "/uploads/avatar-123.jpg"
    },
    "image": "/uploads/post-789.jpg",
    "tags": ["nodejs", "javascript", "backend"],
    "status": "published",
    "views": 0,
    "likesCount": 0,
    "commentsCount": 0,
    "createdAt": "2024-01-16T14:20:00.000Z"
  }
}
```

### 2. Get All Posts
Retrieve all published posts with filtering and pagination.

**Endpoint:** `GET /api/posts`

**Access:** Public

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Full-text search in title/content
- `author` (string): Filter by author ID
- `tags` (string): Comma-separated tags (e.g., "nodejs,javascript")
- `status` (string): Filter by status
- `sortBy` (string): Sort field (createdAt, views, likesCount)
- `order` (string): Sort order (asc, desc)

**Example:**
```
GET /api/posts?page=1&limit=10&tags=nodejs&sortBy=createdAt&order=desc
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "64def789...",
      "title": "Getting Started with Node.js",
      "content": "Node.js is a powerful runtime...",
      "author": {
        "id": "64abc123...",
        "username": "johndoe",
        "avatar": "/uploads/avatar-123.jpg"
      },
      "image": "/uploads/post-789.jpg",
      "tags": ["nodejs", "javascript"],
      "views": 125,
      "likesCount": 15,
      "commentsCount": 8,
      "createdAt": "2024-01-16T14:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

### 3. Get Post by ID
Get a specific post by its ID.

**Endpoint:** `GET /api/posts/:id`

**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64def789...",
    "title": "Getting Started with Node.js",
    "content": "Node.js is a powerful runtime...",
    "author": {
      "id": "64abc123...",
      "username": "johndoe",
      "avatar": "/uploads/avatar-123.jpg",
      "bio": "Software developer"
    },
    "image": "/uploads/post-789.jpg",
    "tags": ["nodejs", "javascript"],
    "status": "published",
    "views": 126,
    "likesCount": 15,
    "commentsCount": 8,
    "createdAt": "2024-01-16T14:20:00.000Z"
  }
}
```

### 4. Update Post
Update an existing post.

**Endpoint:** `PUT /api/posts/:id`

**Access:** Private (Post author or Admin)

**Request Body:**
```json
{
  "title": "Getting Started with Node.js - Updated",
  "content": "Updated content...",
  "tags": ["nodejs", "javascript", "tutorial"],
  "status": "published"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "id": "64def789...",
    "title": "Getting Started with Node.js - Updated",
    "content": "Updated content...",
    "tags": ["nodejs", "javascript", "tutorial"]
  }
}
```

### 5. Delete Post
Delete a post and all associated comments and likes.

**Endpoint:** `DELETE /api/posts/:id`

**Access:** Private (Post author or Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": {}
}
```

---

## 💬 Comment Endpoints

### 1. Add Comment
Add a comment to a post.

**Endpoint:** `POST /api/posts/:postId/comments`

**Access:** Private

**Request Body:**
```json
{
  "content": "Great article! Very informative.",
  "parentComment": "64xyz456..."  // Optional: for nested replies
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "64ghi012...",
    "content": "Great article! Very informative.",
    "author": {
      "id": "64abc123...",
      "username": "johndoe",
      "avatar": "/uploads/avatar-123.jpg"
    },
    "post": "64def789...",
    "likesCount": 0,
    "createdAt": "2024-01-16T15:30:00.000Z"
  }
}
```

### 2. Get Comments for Post
Retrieve all comments for a specific post.

**Endpoint:** `GET /api/posts/:postId/comments`

**Access:** Public

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page (default: 20)
- `sortBy` (string): Sort field
- `order` (string): Sort order

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "64ghi012...",
      "content": "Great article!",
      "author": {
        "id": "64abc123...",
        "username": "johndoe",
        "avatar": "/uploads/avatar-123.jpg"
      },
      "likesCount": 3,
      "createdAt": "2024-01-16T15:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "pages": 1
  }
}
```

### 3. Delete Comment
Delete a comment.

**Endpoint:** `DELETE /api/posts/comments/:id`

**Access:** Private (Comment author or Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "data": {}
}
```

---

## ❤️ Reaction (Like) Endpoints

### 1. Like Post
Like or react to a post.

**Endpoint:** `POST /api/posts/:postId/like`

**Access:** Private

**Request Body:**
```json
{
  "reactionType": "like"  // "like", "love", "haha", "wow", "sad", "angry"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Post liked successfully",
  "data": {
    "id": "64jkl345...",
    "user": "64abc123...",
    "targetType": "Post",
    "targetId": "64def789...",
    "reactionType": "like",
    "createdAt": "2024-01-16T16:00:00.000Z"
  }
}
```

### 2. Unlike Post
Remove a like from a post.

**Endpoint:** `DELETE /api/posts/:postId/like`

**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "data": {}
}
```

### 3. Like Comment
Like or react to a comment.

**Endpoint:** `POST /api/comments/:commentId/like`

**Access:** Private

**Request Body:**
```json
{
  "reactionType": "love"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Comment liked successfully",
  "data": {
    "id": "64mno678...",
    "user": "64abc123...",
    "targetType": "Comment",
    "targetId": "64ghi012...",
    "reactionType": "love"
  }
}
```

### 4. Unlike Comment
Remove a like from a comment.

**Endpoint:** `DELETE /api/comments/:commentId/like`

**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "message": "Comment unliked successfully",
  "data": {}
}
```

---

## 🔌 Socket.io Events

### Client → Server Events

**Join Post Room:**
```javascript
socket.emit('joinPost', postId);
```

**Leave Post Room:**
```javascript
socket.emit('leavePost', postId);
```

**User Typing:**
```javascript
socket.emit('userTyping', {
  postId: '64def789...',
  username: 'johndoe',
  isTyping: true
});
```

### Server → Client Events

**New Post Created:**
```javascript
socket.on('newPost', (post) => {
  console.log('New post:', post);
});
```

**New Comment Added:**
```javascript
socket.on('newComment', ({ comment, postId }) => {
  console.log('New comment on post:', postId);
});
```

**New Like/Reaction:**
```javascript
socket.on('newLike', ({ type, targetId, userId, reactionType }) => {
  console.log('New like:', type, targetId);
});
```

---

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Additional error details"]
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation Error) |
| 401 | Unauthorized (Not authenticated) |
| 403 | Forbidden (No permission) |
| 404 | Not Found |
| 500 | Server Error |

### Example Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 6 characters",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "No authentication token, access denied"
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "User role 'reader' is not authorized to access this route"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Post not found"
}
```

---

## 📋 Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider adding rate limiting middleware.

## 🔒 Security Best Practices

1. Always use HTTPS in production
2. Keep JWT_SECRET secure and unique
3. Implement rate limiting
4. Validate and sanitize all inputs
5. Use environment variables for sensitive data
6. Implement CORS properly for your domain

---

**For more details, see the main README.md file.**

