# 03 - Docker Guide

Learn what Docker is and how we use it in this project.

## 🐳 What is Docker?

**Simple Explanation:**
Docker is like a lunch box for applications. It packages everything an app needs (database, code, settings) into a container that runs the same way on any computer.

**Why We Use It:**
- ✅ **Consistent** - Works the same on your computer, your friend's computer, and servers
- ✅ **Isolated** - Database runs separately, won't mess up your system
- ✅ **Easy** - No need to install MySQL directly on your computer
- ✅ **Clean** - Remove it anytime with one command

---

## 📦 What's in Our Docker Setup?

### docker-compose.yml

This file tells Docker how to run our MySQL database.

```yaml
services:
  db:                          # Service name
    image: mysql:8             # Use MySQL version 8
    container_name: mysql_db   # Name of the container
    restart: always            # Auto-restart if it crashes
    environment:               # Configuration
      MYSQL_ROOT_PASSWORD: rootpassword123
      MYSQL_DATABASE: myapp_db
      MYSQL_USER: appuser
      MYSQL_PASSWORD: userpassword123
    ports:
      - "3306:3306"           # Port mapping (your computer:container)
    volumes:
      - mysql_data:/var/lib/mysql              # Data storage
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # Init script
```

---

## 🔑 Key Concepts

### 1. Container
Think of it as a mini computer running inside your computer.
```bash
# See running containers
docker ps

# See all containers (including stopped)
docker ps -a
```

### 2. Image
A template for creating containers (like a recipe).
```bash
# See downloaded images
docker images
```

### 3. Volume
Permanent storage for data (survives even if container is deleted).
```bash
# See volumes
docker volume ls
```

### 4. Port Mapping
Connect your computer's port to container's port.
```
localhost:3306 → container:3306
```

---

## 🎯 Common Docker Commands

### Starting & Stopping

```bash
# Start all services (defined in docker-compose.yml)
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove all data (CAREFUL!)
docker-compose down -v

# Restart a service
docker-compose restart db
```

### Monitoring

```bash
# Check what's running
docker ps

# View logs
docker logs mysql_db

# Follow logs in real-time
docker logs -f mysql_db

# Check container details
docker inspect mysql_db
```

### Accessing the Container

```bash
# Run commands inside container
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db

# Open bash shell inside container
docker exec -it mysql_db bash

# Check MySQL version
docker exec mysql_db mysql --version
```

---

## 📂 Project Docker Files

### docker-compose.yml
Main configuration file that defines our database service.

**Location:** Root of project

**What it does:**
- Defines MySQL container
- Sets up database credentials
- Maps ports
- Mounts init.sql script
- Creates persistent volume

### init.sql
SQL script that runs when database starts for the first time.

**Location:** Root of project

**What it does:**
- Creates `users` table
- Creates `posts` table
- Inserts sample data
- Sets up relationships

### Dockerfile (Optional)
Not used in our setup because we run Node.js locally, but you could create one for the app too.

---

## 🔄 Docker Workflow

### First Time Setup

```bash
# 1. Start Docker Desktop (macOS/Windows)
# Or: sudo systemctl start docker (Linux)

# 2. Start database
docker-compose up -d

# 3. Wait for initialization
sleep 10

# 4. Verify it's running
docker ps
```

### Daily Development

```bash
# Morning - Start database
docker-compose up -d

# Work on your code...
npm run dev

# Evening - Stop database
docker-compose down
```

### Resetting Everything

```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d

# Database will reinitialize with init.sql
```

---

## 🗄️ Understanding Volumes

Volumes store database data permanently.

### Why Volumes?

Without volumes:
- ❌ Data deleted when container stops
- ❌ Lose all your data
- ❌ Have to restart from scratch

With volumes:
- ✅ Data persists
- ✅ Can stop/start container
- ✅ Data remains safe

### Manage Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect fullstacktraining_mysql_data

# Remove volume (deletes data!)
docker volume rm fullstacktraining_mysql_data

# Remove all unused volumes
docker volume prune
```

---

## 🌐 Port Mapping Explained

```
Your Computer          Docker Container
┌─────────────┐       ┌──────────────┐
│             │       │              │
│  localhost  │       │    MySQL     │
│   :3306  ───┼──────→│    :3306     │
│             │       │              │
└─────────────┘       └──────────────┘
```

When you connect to `localhost:3306`, Docker forwards it to the MySQL container.

---

## 🔍 Troubleshooting Docker

### Docker Desktop Not Running

**macOS/Windows:**
- Open Docker Desktop app
- Wait for whale icon to show "Docker Desktop is running"

**Linux:**
```bash
sudo systemctl status docker
sudo systemctl start docker
```

### Port Already in Use

```bash
# Check what's using port 3306
lsof -i :3306  # macOS/Linux
netstat -ano | findstr :3306  # Windows

# Stop local MySQL if installed
brew services stop mysql  # macOS
sudo service mysql stop   # Linux
```

### Container Won't Start

```bash
# Check logs for errors
docker logs mysql_db

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Permission Denied

```bash
# Linux - Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in

# Or use sudo
sudo docker-compose up -d
```

---

## 💡 Docker Best Practices

### DO:
- ✅ Use `docker-compose down` to stop cleanly
- ✅ Check logs when troubleshooting
- ✅ Use `-d` flag to run in background
- ✅ Keep Docker Desktop updated

### DON'T:
- ❌ Don't use `docker-compose down -v` unless you want to delete data
- ❌ Don't force-quit Docker Desktop
- ❌ Don't run multiple database containers on same port
- ❌ Don't commit passwords to git

---

## 🎓 What You Learned

- ✅ What Docker is and why we use it
- ✅ How docker-compose.yml works
- ✅ Common Docker commands
- ✅ How to manage containers and volumes
- ✅ How port mapping works
- ✅ How to troubleshoot issues

---

## 🔗 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Docker Image](https://hub.docker.com/_/mysql)

---

**Previous:** ← [Quick Start](02-quick-start.md)  
**Next:** [Database Basics](04-database-basics.md) →
