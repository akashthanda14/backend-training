# 02 - Quick Start Guide

Get your app running in 5 minutes! This guide assumes you've completed the [Setup Guide](01-setup.md).

## 🎯 Goal

By the end of this guide, you'll have:
- ✅ MySQL database running in Docker
- ✅ Node.js application running
- ✅ Tested the API successfully

---

## 📝 Step-by-Step Instructions

### Step 1: Open Terminal

**macOS:**
- Press `Cmd + Space`
- Type "Terminal"
- Press Enter

**Windows:**
- Press `Win + R`
- Type "cmd" or "powershell"
- Press Enter

**Navigate to Project:**
```bash
cd path/to/"Full stack training"
```

---

### Step 2: Start Docker Desktop

**macOS/Windows:**
- Open Docker Desktop application
- Wait for "Docker is running" indicator
- This might take 30-60 seconds

**Linux:**
```bash
sudo systemctl start docker
```

---

### Step 3: Start MySQL Database

```bash
docker-compose up -d
```

**What this does:**
- Downloads MySQL 8 image (first time only, ~200MB)
- Creates a database container
- Runs initialization script (`init.sql`)
- Creates `users` and `posts` tables with sample data

**Expected output:**
```
[+] Running 2/2
 ✔ Network fullstacktraining_default   Created
 ✔ Container mysql_db                  Started
```

**Wait 10 seconds** for database to initialize:
```bash
sleep 10
```

---

### Step 4: Verify Database is Running

```bash
docker ps
```

**You should see:**
```
CONTAINER ID   IMAGE     ...   STATUS         PORTS                    NAMES
abc123def456   mysql:8   ...   Up 30 seconds  0.0.0.0:3306->3306/tcp   mysql_db
```

**Check database logs:**
```bash
docker logs mysql_db
```

**Look for:**
```
[Server] /usr/sbin/mysqld: ready for connections
```

---

### Step 5: Test Database Connection

```bash
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "SELECT COUNT(*) as total_users FROM users;"
```

**Expected output:**
```
+-------------+
| total_users |
+-------------+
|           5 |
+-------------+
```

✅ **Database is working!**

---

### Step 6: Start Node.js Application

**Open a new terminal window** (keep the first one open), then:

```bash
cd path/to/"Full stack training"
npm run dev
```

**Expected output:**
```
[nodemon] starting `node src/index.js`
Server listening on port 3000
✓ Database connection established successfully
✓ Connected to database: myapp_db at localhost:3306
```

**Leave this terminal running!**

---

### Step 7: Test the Application

**Open a third terminal** (or new tab), then:

**Test 1: Health Check**
```bash
curl http://localhost:3000/api/v1/health
```

**Expected response:**
```json
{"status":"ok","db":"connected"}
```

**Test 2: Get Users**
```bash
curl http://localhost:3000/api/v1/users
```

**Expected response:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john.doe@example.com",
      "created_at": "2025-11-01T10:00:00.000Z"
    },
    ...
  ]
}
```

---

## 🎉 Success!

If you see the JSON responses above, **everything is working perfectly!**

### What's Running:
- ✅ **MySQL Database** - Port 3306 (in Docker)
- ✅ **Express API Server** - Port 3000 (local)
- ✅ **Auto-reload** - Changes restart automatically (nodemon)

---

## 🌐 Try in Your Browser

Open these URLs in your web browser:

1. **Health Check:**
   ```
   http://localhost:3000/api/v1/health
   ```

2. **Get All Users:**
   ```
   http://localhost:3000/api/v1/users
   ```

You should see JSON responses!

---

## 🛑 How to Stop Everything

### Stop Application
In the terminal running `npm run dev`:
- Press `Ctrl + C`

### Stop Database
```bash
docker-compose down
```

**Expected output:**
```
[+] Running 2/2
 ✔ Container mysql_db  Removed
 ✔ Network fullstacktraining_default  Removed
```

---

## 🔄 How to Restart

### Start Database
```bash
docker-compose up -d
```

### Start Application
```bash
npm run dev
```

That's it!

---

## 📊 Visual Overview

```
┌─────────────────────────────────────────┐
│                                         │
│  YOU (Browser/Terminal)                 │
│                                         │
└──────────────┬──────────────────────────┘
               │
               │ HTTP Requests
               ↓
┌─────────────────────────────────────────┐
│  Express API Server (Port 3000)         │
│  - Handles requests                     │
│  - Connects to database                 │
│  - Returns JSON                         │
└──────────────┬──────────────────────────┘
               │
               │ SQL Queries
               ↓
┌─────────────────────────────────────────┐
│  MySQL Database (Docker, Port 3306)     │
│  - Stores users                         │
│  - Stores posts                         │
│  - Returns data                         │
└─────────────────────────────────────────┘
```

---

## ✅ Quick Commands Reference

```bash
# Start database
docker-compose up -d

# Start app
npm run dev

# Check database status
docker ps

# View database logs
docker logs mysql_db

# Stop database
docker-compose down

# Test API
curl http://localhost:3000/api/v1/health
```

---

## 🆘 Something Not Working?

### Application won't start
```bash
# Check if port 3000 is already used
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process and try again
```

### Database connection failed
```bash
# Make sure Docker is running
docker ps

# Restart database
docker-compose down
docker-compose up -d
sleep 10
```

### Can't access API
```bash
# Make sure app is running
# Look for "Server listening on port 3000"

# Check .env file
cat .env
# DB_HOST should be "localhost"
```

---

## 🎓 What You Learned

- ✅ How to start Docker containers
- ✅ How to run a Node.js application
- ✅ How to test REST APIs
- ✅ How to check if services are running
- ✅ How to stop everything properly

---

**Next Steps:**
- Read [Docker Guide](03-docker-guide.md) to understand Docker better
- Explore [Database Basics](04-database-basics.md) to learn about your data
- Check [API Documentation](07-api-documentation.md) to see all endpoints

**Previous:** ← [Setup Guide](01-setup.md)  
**Next:** [Docker Guide](03-docker-guide.md) →
