# 🚀 Quick Reference Card

## ⚡ Installation (3 Commands)

```bash
npm install
# Create .env file (see env.template)
npm run dev
```

## 📝 Environment Setup

Copy `env.template` to `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-blogging
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

## 🔗 API Endpoints Cheatsheet

### Authentication
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/signup` | POST | ❌ | Register user |
| `/api/auth/login` | POST | ❌ | Login & get token |
| `/api/auth/me` | GET | ✅ | Get current user |

### Users
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users` | GET | ❌ | List all users |
| `/api/users/:id` | GET | ❌ | Get user by ID |
| `/api/users/:id` | PUT | ✅ | Update profile |

### Posts
| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/api/posts` | POST | ✅ | Author/Admin | Create post |
| `/api/posts` | GET | ❌ | - | List posts |
| `/api/posts/:id` | GET | ❌ | - | Get post |
| `/api/posts/:id` | PUT | ✅ | Author/Admin | Update post |
| `/api/posts/:id` | DELETE | ✅ | Author/Admin | Delete post |

### Comments
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/posts/:postId/comments` | POST | ✅ | Add comment |
| `/api/posts/:postId/comments` | GET | ❌ | List comments |
| `/api/posts/comments/:id` | DELETE | ✅ | Delete comment |

### Likes/Reactions
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/posts/:postId/like` | POST | ✅ | Like post |
| `/api/posts/:postId/like` | DELETE | ✅ | Unlike post |
| `/api/comments/:commentId/like` | POST | ✅ | Like comment |
| `/api/comments/:commentId/like` | DELETE | ✅ | Unlike comment |

## 🎯 Common Request Examples

### Signup
```json
POST /api/auth/signup
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "author"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Post
```json
POST /api/posts
Header: Authorization: Bearer <token>
{
  "title": "My Post",
  "content": "Post content...",
  "tags": ["nodejs", "javascript"],
  "status": "published"
}
```

### Add Comment
```json
POST /api/posts/:postId/comments
Header: Authorization: Bearer <token>
{
  "content": "Great article!"
}
```

### Like Post
```json
POST /api/posts/:postId/like
Header: Authorization: Bearer <token>
{
  "reactionType": "like"
}
```

## 🔍 Query Parameters

### GET /api/posts
```
?page=1
&limit=10
&search=nodejs
&author=userId
&tags=nodejs,javascript
&status=published
&sortBy=createdAt
&order=desc
```

### GET /api/users
```
?page=1
&limit=10
&role=author
&search=john
```

## 🔌 Socket.io Events

### Emit (Client → Server)
```javascript
socket.emit('joinPost', postId);
socket.emit('leavePost', postId);
socket.emit('userTyping', { postId, username, isTyping });
```

### Listen (Server → Client)
```javascript
socket.on('newPost', (post) => {});
socket.on('newComment', ({ comment, postId }) => {});
socket.on('newLike', ({ type, targetId, userId, reactionType }) => {});
socket.on('userTyping', ({ username, isTyping }) => {});
```

## 📦 NPM Scripts

```bash
npm start          # Production mode
npm run dev        # Development mode (with nodemon)
```

## 🗂️ Project Structure

```
marya/
├── config/        # Database config
├── controllers/   # Business logic
├── middleware/    # Auth, validation, upload
├── models/        # Database schemas
├── routes/        # API routes
├── uploads/       # Uploaded files
└── server.js      # Main app file
```

## 👤 User Roles

- **reader** (default): View, comment, like
- **author**: + Create posts
- **admin**: + Manage all content

## 🎨 Reaction Types

- `like`
- `love`
- `haha`
- `wow`
- `sad`
- `angry`

## ✅ Testing Checklist

1. [ ] Install: `npm install`
2. [ ] Create `.env` file
3. [ ] Start MongoDB
4. [ ] Run: `npm run dev`
5. [ ] Import Postman collection
6. [ ] Signup → get token
7. [ ] Set token in Postman
8. [ ] Create post
9. [ ] Add comment
10. [ ] Like post

## 🐛 Quick Troubleshooting

**MongoDB connection failed:**
```bash
mongod  # Start MongoDB
```

**Port in use:**
```env
PORT=3000  # Change in .env
```

**Token invalid:**
- Check format: `Bearer <token>`
- Get fresh token from login

**Can't create post:**
- Must be `author` or `admin` role
- Check token is set

## 📁 Important Files

| File | Purpose |
|------|---------|
| `server.js` | Main application |
| `package.json` | Dependencies |
| `.env` | Configuration |
| `Social_Blogging_Platform.postman_collection.json` | API tests |
| `socket-test.html` | Socket.io tester |
| `README.md` | Full documentation |
| `SETUP_GUIDE.md` | Installation guide |
| `API_DOCUMENTATION.md` | API reference |

## 🎯 Default Values

- Port: `5000`
- Page size: `10`
- Max file size: `5MB`
- Token expiry: `30 days`
- Default role: `reader`
- Default status: `published`

## 🔐 Authorization Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Response Format

### Success
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "...",
  "errors": [ ... ]
}
```

### Paginated
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

## 🌐 Base URL

```
http://localhost:5000
```

## 🎉 Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp env.template .env

# 3. Start MongoDB
mongod

# 4. Run server
npm run dev

# 5. Test
http://localhost:5000
```

---

**That's it! You're ready to build! 🚀**

For detailed info, see:
- `README.md` - Complete guide
- `SETUP_GUIDE.md` - Step-by-step setup
- `API_DOCUMENTATION.md` - Full API reference
- `PROJECT_OVERVIEW.md` - Architecture details

