# 🏗️ System Architecture

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  • Postman (API Testing)                                        │
│  • Web Browser (Socket.io Test Client)                          │
│  • Mobile/Web App (Future Frontend)                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS + WebSocket
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Express.js Server                       │  │
│  │                    (server.js)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│              ┌──────────────┴──────────────┐                   │
│              │                              │                   │
│         ┌────▼─────┐                  ┌────▼─────┐             │
│         │   HTTP   │                  │ Socket.io│             │
│         │  Routes  │                  │  Events  │             │
│         └────┬─────┘                  └────┬─────┘             │
│              │                              │                   │
│  ┌───────────▼──────────────────────────────▼──────────────┐  │
│  │                   MIDDLEWARE LAYER                        │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  • auth.js         → JWT Authentication & Authorization   │  │
│  │  • validation.js   → Request Validation                   │  │
│  │  • upload.js       → File Upload Handling                 │  │
│  │  • errorHandler.js → Global Error Management             │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────────┐  │
│  │                     ROUTES LAYER                          │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  • authRoutes.js      → /api/auth/*                       │  │
│  │  • userRoutes.js      → /api/users/*                      │  │
│  │  • postRoutes.js      → /api/posts/*                      │  │
│  │  • commentRoutes.js   → /api/posts/:id/comments/*         │  │
│  │  • likeRoutes.js      → /api/**/like                      │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────────┐  │
│  │                   CONTROLLERS LAYER                       │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  • authController.js    → Authentication Logic            │  │
│  │  • userController.js    → User Management                 │  │
│  │  • postController.js    → Post CRUD Operations            │  │
│  │  • commentController.js → Comment Management              │  │
│  │  • likeController.js    → Reaction/Like Logic             │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                              │
                    Mongoose ODM
                              │
┌──────────────────────────────▼───────────────────────────────────┐
│                        DATA LAYER                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   MODELS (Schemas)                         │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  • User.js    → User accounts & authentication             │ │
│  │  • Post.js    → Blog posts with metadata                   │ │
│  │  • Comment.js → Comments & nested replies                  │ │
│  │  • Like.js    → Reactions/likes on posts & comments        │ │
│  └────────────────────────────┬───────────────────────────────┘ │
│                               │                                  │
│  ┌────────────────────────────▼───────────────────────────────┐ │
│  │                  MongoDB Database                          │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  Collections:                                              │ │
│  │    • users (User accounts)                                 │ │
│  │    • posts (Blog posts)                                    │ │
│  │    • comments (All comments)                               │ │
│  │    • likes (All reactions)                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│  • /uploads → File system storage for images                    │
│  • Static file serving via Express                              │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### 1. HTTP Request Flow

```
Client Request
      │
      ▼
[Express.js Server]
      │
      ▼
[CORS & Body Parser Middleware]
      │
      ▼
[Route Matching] ──► No Match ──► 404 Error
      │
      ▼ Match Found
[Middleware Chain]
      │
      ├──► Authentication (if required)
      │
      ├──► Authorization (role check)
      │
      ├──► Validation (request data)
      │
      └──► File Upload (if multipart)
      │
      ▼
[Controller Function]
      │
      ├──► Business Logic
      │
      ├──► Database Operations (Mongoose)
      │
      └──► Socket.io Events (if applicable)
      │
      ▼
[Response]
      │
      ├──► Success (200/201)
      │
      └──► Error ──► Error Handler ──► Error Response
```

### 2. Socket.io Event Flow

```
Client Connects
      │
      ▼
[Socket.io Server]
      │
      ├──► Connection Event
      │         │
      │         └──► Assign Socket ID
      │
      ▼
[Client Actions]
      │
      ├──► joinPost(postId)
      │         │
      │         └──► Join Socket Room
      │
      ├──► leavePost(postId)
      │         │
      │         └──► Leave Socket Room
      │
      └──► userTyping({...})
                │
                └──► Broadcast to Room
      
[Server Events]
      │
      ├──► New Post Created
      │         │
      │         └──► Emit: newPost
      │
      ├──► New Comment Added
      │         │
      │         └──► Emit: newComment
      │
      └──► Post/Comment Liked
                │
                └──► Emit: newLike
      
All Events ──► Received by Connected Clients
```

## 🔐 Authentication Flow

```
1. SIGNUP
   User Submits → Validation → Hash Password → Create User → Generate JWT → Return Token

2. LOGIN
   User Submits → Find User → Compare Password → Generate JWT → Return Token

3. PROTECTED ROUTE
   Request → Extract Token → Verify JWT → Get User → Attach to req.user → Continue

4. AUTHORIZATION
   Request → Check req.user.role → Verify Permission → Allow/Deny
```

## 💾 Data Relationships

```
User ────────┐
  │          │
  │          │ (author)
  │          │
  │          ▼
  │        Post ────────┐
  │          │          │
  │          │          │ (post)
  │          │          │
  │          │          ▼
  │          │        Comment
  │          │          │
  │ (user)   │ (user)   │ (user)
  │          │          │
  └──────────┴──────────┴───► Like
                              (targetType: Post/Comment)
```

### Database Relations

**User Model:**
- Has many Posts (as author)
- Has many Comments (as author)
- Has many Likes (as user)

**Post Model:**
- Belongs to User (author)
- Has many Comments
- Has many Likes (polymorphic)

**Comment Model:**
- Belongs to User (author)
- Belongs to Post
- Has many Likes (polymorphic)
- Can have parent Comment (nested)

**Like Model:**
- Belongs to User
- Polymorphic to Post or Comment

## 🎯 Component Responsibilities

### Server Layer (`server.js`)
- Initialize Express app
- Setup middleware
- Configure Socket.io
- Register routes
- Database connection
- Error handling
- Server startup

### Route Layer
- Define API endpoints
- Map URLs to controllers
- Apply middleware chains
- Handle HTTP methods

### Middleware Layer
- **auth.js**: Verify JWT, check roles
- **validation.js**: Validate request data
- **upload.js**: Handle file uploads
- **errorHandler.js**: Format error responses

### Controller Layer
- Receive requests
- Execute business logic
- Interact with models
- Emit Socket.io events
- Return responses

### Model Layer
- Define schemas
- Data validation
- Database operations
- Custom methods
- Middleware (hooks)

## 🔌 Socket.io Architecture

```
Server Side                    Client Side
    │                              │
    ├──► io.on('connection')       │
    │         │                    │
    │         ├──► socket.id       │
    │         │                    │
    │         ├──► socket.on('joinPost')
    │         │                    │
    │         ├──► socket.on('leavePost')
    │         │                    │
    │         └──► socket.on('userTyping')
    │                              │
    ├──► io.emit('newPost')   ────►│
    │                              │
    ├──► io.emit('newComment')────►│
    │                              │
    └──► io.emit('newLike')   ────►│
```

## 📦 Module Dependencies

```
server.js
    │
    ├──► express
    ├──► http
    ├──► socket.io
    ├──► cors
    ├──► dotenv
    │
    ├──► config/database.js
    │         └──► mongoose
    │
    ├──► routes/*
    │         │
    │         └──► controllers/*
    │                   │
    │                   └──► models/*
    │                             │
    │                             └──► mongoose
    │
    └──► middleware/*
              │
              ├──► jsonwebtoken
              ├──► bcryptjs
              ├──► multer
              └──► express-validator
```

## 🛡️ Security Layers

```
1. Input Layer
   └──► Validation (express-validator)
   └──► Sanitization
   └──► Type checking

2. Authentication Layer
   └──► JWT verification
   └──► Token expiration
   └──► User existence check

3. Authorization Layer
   └──► Role-based access control
   └──► Resource ownership check
   └──► Permission verification

4. Data Layer
   └──► Mongoose schema validation
   └──► Password hashing (bcrypt)
   └──► Unique constraints

5. File Upload Layer
   └──► File type validation
   └──► File size limits
   └──► Secure file naming
```

## 🚀 Performance Optimizations

### Current Implementations:
- **Database Indexes**: Fast queries on common fields
- **Pagination**: Limit data transfer
- **Lean Queries**: Return plain objects when possible
- **Select Fields**: Only fetch needed data
- **Connection Pooling**: Mongoose default

### Future Enhancements:
- Redis caching
- CDN for static files
- Query result caching
- Database sharding
- Load balancing

## 📊 Scalability Considerations

```
Current: Single Server
    ├──► Express.js
    ├──► Socket.io
    └──► MongoDB

Future: Distributed System
    │
    ├──► Load Balancer
    │         │
    │         ├──► App Server 1
    │         ├──► App Server 2
    │         └──► App Server N
    │
    ├──► Redis (Session + Cache)
    │
    ├──► MongoDB Replica Set
    │
    └──► File Storage (S3/CDN)
```

## 🔄 API Versioning Strategy

Currently: v1 (implicit)

Future expansion:
```
/api/v1/posts
/api/v2/posts
```

## 🧪 Testing Architecture

```
Unit Tests (Future)
    └──► Test Controllers
    └──► Test Models
    └──► Test Middleware

Integration Tests (Future)
    └──► Test API Endpoints
    └──► Test Database Operations
    └──► Test Authentication Flow

E2E Tests (Future)
    └──► Test Complete User Flows
    └──► Test Real-time Features
```

## 📈 Monitoring Points

Key metrics to track:
- Request response time
- Error rates
- Database query performance
- Active Socket.io connections
- File upload success/failure
- Authentication success/failure
- API endpoint usage

## 🔧 Configuration Management

```
Environment Variables (.env)
    │
    ├──► PORT
    ├──► MONGODB_URI
    ├──► JWT_SECRET
    └──► NODE_ENV

Config Files
    │
    └──► config/database.js
```

---

## 📝 Architecture Decisions

### Why Express.js?
- Lightweight and flexible
- Large ecosystem
- Easy to learn
- Great middleware support

### Why MongoDB?
- Flexible schema
- JSON-like documents
- Great for rapid development
- Scalable

### Why Socket.io?
- Easy real-time implementation
- Automatic fallback
- Room support
- Large community

### Why JWT?
- Stateless authentication
- Scalable
- Works across domains
- Industry standard

---

**This architecture provides a solid foundation for a scalable, maintainable social blogging platform!** 🏗️

