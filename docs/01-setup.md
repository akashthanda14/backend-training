# 01 - Setup Guide

Welcome! This guide will help you install everything needed to run this project.

## 📋 What You Need to Install

### 1. Node.js (JavaScript Runtime)

Node.js lets you run JavaScript on your computer (not just in browsers).

**Installation:**

**macOS:**
```bash
# Using Homebrew
brew install node@20

# Or download from: https://nodejs.org/
```

**Windows:**
- Download from: https://nodejs.org/
- Choose "LTS" version (recommended)
- Run the installer

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fedora
sudo dnf install nodejs
```

**Verify Installation:**
```bash
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

---

### 2. Docker (Container Platform)

Docker lets you run applications in isolated containers. We use it for MySQL database.

**Installation:**

**macOS:**
```bash
# Download Docker Desktop
# Visit: https://www.docker.com/products/docker-desktop

# Or using Homebrew
brew install --cask docker
```

**Windows:**
- Download Docker Desktop: https://www.docker.com/products/docker-desktop
- Run installer and restart computer

**Linux:**
```bash
# Ubuntu
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and log back in
```

**Verify Installation:**
```bash
docker --version          # Should show Docker version
docker-compose --version  # Should show docker-compose version
```

**Start Docker:**
- macOS/Windows: Open Docker Desktop application
- Linux: `sudo systemctl start docker`

---

### 3. Git (Optional but Recommended)

Git helps you download the project and manage code changes.

**Installation:**

**macOS:**
```bash
brew install git
```

**Windows:**
- Download from: https://git-scm.com/download/win

**Linux:**
```bash
sudo apt-get install git  # Ubuntu/Debian
sudo dnf install git      # Fedora
```

**Verify:**
```bash
git --version
```

---

## 📥 Getting the Project

### Option 1: If Using Git

```bash
# Clone the repository (if you have a Git repo)
git clone <repository-url>
cd "Full stack training"
```

### Option 2: Manual Download

1. Download the project folder
2. Open Terminal/Command Prompt
3. Navigate to the project:
```bash
cd path/to/"Full stack training"
```

---

## 🔧 Project Setup

### 1. Install Node.js Dependencies

```bash
# Make sure you're in the project folder
npm install
```

This downloads all required JavaScript packages. It might take 1-2 minutes.

**You should see:**
```
added 150 packages, and audited 151 packages in 30s
```

---

### 2. Create Environment File

The `.env` file stores your configuration (like database passwords).

```bash
# Copy the example file
cp .env.example .env
```

**For macOS/Linux:**
```bash
cat > .env << 'EOF'
# Node Environment
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=myapp_db
DB_USER=appuser
DB_PASSWORD=userpassword123

# Application Port
PORT=3000
EOF
```

**For Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

---

### 3. Verify Files

Make sure you have these important files:

```bash
ls -la
```

You should see:
- ✅ `docker-compose.yml` - Docker configuration
- ✅ `init.sql` - Database setup
- ✅ `.env` - Your environment variables
- ✅ `package.json` - Node.js configuration
- ✅ `node_modules/` - Installed packages (folder)

---

## ✅ Installation Complete!

You've successfully installed everything! 

### What You Have Now:
- ✅ Node.js - To run JavaScript
- ✅ Docker - To run MySQL database
- ✅ Project dependencies - All required packages
- ✅ Environment configuration - Settings file

### Next Steps:
Go to **[Quick Start Guide](02-quick-start.md)** to run the application! 🚀

---

## 🆘 Problems?

### Node.js Not Found
```bash
# Try closing and reopening terminal
# Or check installation path
which node
```

### Docker Not Running
```bash
# Start Docker Desktop (macOS/Windows)
# Or on Linux:
sudo systemctl start docker
```

### Permission Errors
```bash
# macOS/Linux - Use sudo for Docker
sudo docker ps

# Or add user to docker group (Linux)
sudo usermod -aG docker $USER
# Log out and back in
```

### npm install Fails
```bash
# Clear npm cache
npm cache clean --force
npm install
```

---

**Next:** [Quick Start Guide](02-quick-start.md) →
