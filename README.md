# Social Blogging Platform API

A real-time social blogging platform built with Node.js, Express, MongoDB, and Socket.io. This API supports user authentication, post management, real-time interactions, comments, and reactions.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (reader, author, admin)
- **User Management**: User profiles with avatars, bio, and follow system
- **Posts**: Create, read, update, and delete blog posts with image uploads
- **Comments**: Nested commenting system with real-time updates
- **Reactions**: Like/react to posts and comments with multiple reaction types
- **Real-time Updates**: Socket.io integration for live notifications
- **Search & Filtering**: Advanced search and filtering for posts
- **Pagination**: Infinite scroll support with pagination
- **File Uploads**: Image upload support using Multer

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher) - running locally or MongoDB Atlas account
- **npm** or **yarn** package manager
- **Postman** (for API testing)

## 🛠️ Installation

### 1. Clone or extract the project

```bash
cd marya
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-blogging
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important**: 
- If using **MongoDB Atlas**, replace `MONGODB_URI` with your connection string
- Change `JWT_SECRET` to a secure random string in production

### 4. Start MongoDB

If using local MongoDB:

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

Or use **MongoDB Atlas** cloud database.

### 5. Run the application

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash

npm install nodemailer
npm start

```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | No |
| GET | `/api/users/:id` | Get user by ID | No |
| PUT | `/api/users/:id` | Update user profile | Yes |

### Posts
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/posts` | Create new post | Yes | author, admin |
| GET | `/api/posts` | Get all posts | No | - |
| GET | `/api/posts/:id` | Get post by ID | No | - |
| PUT | `/api/posts/:id` | Update post | Yes | author, admin |
| DELETE | `/api/posts/:id` | Delete post | Yes | author, admin |

### Comments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/posts/:postId/comments` | Add comment | Yes |
| GET | `/api/posts/:postId/comments` | Get comments | No |
| DELETE | `/api/posts/comments/:id` | Delete comment | Yes |

### Reactions (Likes)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/posts/:postId/like` | Like post | Yes |
| DELETE | `/api/posts/:postId/like` | Unlike post | Yes |
| POST | `/api/comments/:commentId/like` | Like comment | Yes |
| DELETE | `/api/comments/:commentId/like` | Unlike comment | Yes |

## 🧪 Testing with Postman

### Import Postman Collection

1. Open **Postman**
2. Click **Import** button
3. Select the file: `Social_Blogging_Platform.postman_collection.json`
4. The collection will be imported with all endpoints ready to test

### Setup Postman Variables

The collection includes two variables:
- `base_url`: Default is `http://localhost:5000`
- `auth_token`: Will be empty initially. Copy the token from login/signup response

### Quick Start Testing Flow

1. **Signup a new user** (Authentication → Signup)
   - Use role: "author" to create posts
   - Copy the `token` from the response

2. **Set auth token**
   - In Postman, go to the collection variables
   - Paste the token into the `auth_token` variable
   - Or manually add `Bearer <token>` to Authorization header

3. **Create a post** (Posts → Create Post)
   - Only works if you're logged in as author or admin

4. **Get all posts** (Posts → Get All Posts)
   - Works without authentication

5. **Add a comment** (Comments → Add Comment to Post)
   - Replace `:postId` with actual post ID
   - Requires authentication

6. **Like a post** (Reactions → Like Post)
   - Replace `:postId` with actual post ID
   - Requires authentication

## 🔌 Real-Time Features (Socket.io)

The API emits real-time events for:

### Events Emitted by Server:
- `newPost`: When a new post is created
- `newComment`: When a comment is added
- `newLike`: When a post/comment is liked

### Client Events:
- `joinPost`: Join a specific post room for updates
- `leavePost`: Leave a post room
- `userTyping`: Notify others when user is typing

### Example Socket.io Client Connection:

```javascript
const socket = io('http://localhost:5000');

// Listen for new posts
socket.on('newPost', (post) => {
  console.log('New post created:', post);
});

// Listen for new comments
socket.on('newComment', ({ comment, postId }) => {
  console.log('New comment on post:', postId, comment);
});

// Join a specific post room
socket.emit('joinPost', 'post_id_here');
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js            # Authentication logic
│   ├── userController.js            # User management
│   ├── postController.js            # Post CRUD operations
│   ├── commentController.js         # Comment management
│   └── likeController.js            # Reaction/like logic
|   └── followController.js          # Reaction/follow logic
|   └── notificationController.js    # notifications managment
|   └── readerController.js          # reader role
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── upload.js            # File upload with multer
│   ├── validation.js        # Request validation
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Post.js              # Post schema
│   ├── Comment.js           # Comment schema
│   └── Like.js              # Like/Reaction schema
|   └── Notification.js      # Notification schema
├── routes/
│   ├── authRoutes.js           # Auth endpoints
│   ├── userRoutes.js           # User endpoints
│   ├── postRoutes.js           # Post endpoints
│   ├── commentRoutes.js        # Comment endpoints
│   └── likeRoutes.js           # Like endpoints
|   └── notificationRoutes.js   # notification endpoints
|   └── readerRoutes.js         # Reader role endpoints
|
├── uploads/                    # Uploaded files directory
|ــ services/
|   └── emailService.js      # config mail
|   └── likeController.js    # config notifications
├── server.js                # Main application file
├── package.json             # Dependencies
├── .gitignore               # Git ignore file
└── Social_Blogging_Platform.postman_collection.json
```

## 🔐 User Roles

### Reader (Default)
- Can view posts and comments
- Can add comments
- Can like posts and comments

### Author
- All reader permissions
- Can create posts
- Can edit/delete own posts

### Admin
- All author permissions
- Can edit/delete any post
- Can delete any comment
- Can manage users

## 📝 Example API Requests

### 1. Register a new user

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "author"
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Create a Post

```bash
POST /api/posts
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "title": "My First Blog Post",
  "content": "This is the content of my blog post...",
  "tags": ["nodejs", "javascript"],
  "status": "published"
}
```

### 4. Get Posts with Filtering

```bash
GET /api/posts?page=1&limit=10&search=nodejs&sortBy=createdAt&order=desc
```

### 5. Add a Comment

```bash
POST /api/posts/:postId/comments
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "content": "Great article!"
}
```

## 🖼️ File Upload

To upload images with posts or user avatars, use `multipart/form-data`:

### Upload Post with Image

```bash
POST /api/posts
Authorization: Bearer <your_token>
Content-Type: multipart/form-data

title=My Post
content=Post content here
image=<file>
tags=["nodejs", "tutorial"]
```

**Supported formats**: JPEG, JPG, PNG, GIF, WEBP  
**Max file size**: 5MB

## ⚙️ Query Parameters

### Posts Endpoint (`GET /api/posts`)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in title and content
- `author`: Filter by author ID
- `tags`: Filter by tags (comma-separated)
- `status`: Filter by status (draft, published, archived)
- `sortBy`: Sort field (createdAt, views, likesCount)
- `order`: Sort order (asc, desc)

### Users Endpoint (`GET /api/users`)
- `page`: Page number
- `limit`: Items per page
- `role`: Filter by role
- `search`: Search by username or email

## 🐛 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Additional error details"]
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Server Error

## 🔧 Troubleshooting

### MongoDB Connection Issues
```
Error: Could not connect to MongoDB
```
**Solution**: Make sure MongoDB is running and the connection string in `.env` is correct.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change the `PORT` in `.env` file or kill the process using port 5000.

### JWT Token Invalid
```
Token is not valid
```
**Solution**: Make sure you're sending the token in the format: `Bearer <token>`

### File Upload Fails
```
Only image files are allowed
```
**Solution**: Ensure you're uploading JPEG, PNG, GIF, or WEBP files under 5MB.

## 📊 Database Schema

### User Model
- username (String, unique)
- email (String, unique)
- password (String, hashed)
- role (String: reader/author/admin)
- bio (String)
- avatar (String)
- followers/following (Array of User IDs)

### Post Model
- title (String)
- content (String)
- author (Reference to User)
- image (String)
- tags (Array of Strings)
- status (String: draft/published/archived)
- views, likesCount, commentsCount (Numbers)

### Comment Model
- content (String)
- author (Reference to User)
- post (Reference to Post)
- parentComment (Reference to Comment, optional)
- likesCount (Number)

### Like Model
- user (Reference to User)
- targetType (String: Post/Comment)
- targetId (ObjectId)
- reactionType (String: like/love/haha/wow/sad/angry)

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_very_secure_random_string_here
```

### Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **DigitalOcean**: Deploy on VPS
- **AWS EC2**: Full control deployment
- **Railway**: Simple deployment with auto-scaling

## 📄 License

This project is open-source and available for learning and development purposes.

## 👨‍💻 Author

Built with ❤️ for learning and demonstration purposes.

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Happy Coding! 🎉**

