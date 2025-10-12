# Quick Setup Guide

## Step-by-Step Setup Instructions

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Setup Environment Variables

Create a `.env` file in the root directory:

**For Windows (PowerShell):**
```powershell
@"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-blogging
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding UTF8
```

**For macOS/Linux:**
```bash
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-blogging
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
EOF
```

**Or manually create** a `.env` file with the content above.

### 3️⃣ Start MongoDB

Choose one option:

#### Option A: Local MongoDB
**Windows:**
```bash
# Make sure MongoDB is installed, then run:
mongod
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `MONGODB_URI` in `.env` with your connection string

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/social-blogging?retryWrites=true&w=majority
```

### 4️⃣ Start the Server

**Development mode (recommended for testing):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
MongoDB Connected: localhost
Server running in development mode on port 5000
Socket.io listening for real-time connections
```

### 5️⃣ Import Postman Collection

1. Open **Postman**
2. Click **Import** → **Choose Files**
3. Select `Social_Blogging_Platform.postman_collection.json`
4. Collection imported! ✅

### 6️⃣ Test the API

#### First API Call - Check Server Status
```bash
GET http://localhost:5000/
```

Expected response:
```json
{
  "success": true,
  "message": "Welcome to Social Blogging Platform API",
  "version": "1.0.0"
}
```

#### Create Your First User
In Postman, run: **Authentication → Signup**

```json
{
  "username": "testauthor",
  "email": "author@test.com",
  "password": "password123",
  "role": "author"
}
```

**Copy the `token` from the response!**

#### Set Auth Token in Postman
1. In Postman, click on the collection name
2. Go to **Variables** tab
3. Paste the token in `auth_token` Current Value
4. Click **Save**

#### Create Your First Post
Run: **Posts → Create Post**

```json
{
  "title": "My First Blog Post",
  "content": "Hello World! This is my first post.",
  "tags": ["test", "hello"],
  "status": "published"
}
```

#### Get All Posts
Run: **Posts → Get All Posts**

You should see your post in the response!

## 🎯 Quick Test Checklist

- [ ] MongoDB is running
- [ ] Server starts without errors
- [ ] Can signup a new user
- [ ] Received JWT token
- [ ] Can create a post (as author)
- [ ] Can view all posts
- [ ] Can add a comment
- [ ] Can like a post

## 🔥 Common Issues

### Issue: "Cannot connect to MongoDB"
**Fix:** Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Issue: "Port 5000 already in use"
**Fix:** Change port in `.env`:
```env
PORT=3000
```

### Issue: "Module not found"
**Fix:** Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

### Issue: "Unauthorized" when creating post
**Fix:** Make sure:
1. You're logged in as `author` or `admin` role
2. Token is set in Postman `auth_token` variable
3. Authorization header is `Bearer <token>`

## 🚀 You're Ready!

Your Social Blogging Platform API is now running! Start testing with Postman.

**Next Steps:**
- Create more users with different roles
- Test all CRUD operations
- Try real-time features with Socket.io
- Upload images with posts
- Explore search and filtering

Happy coding! 🎉

