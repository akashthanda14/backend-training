# 04 - Database Basics

Understand your MySQL database and how data is organized.

## 🗄️ What is a Database?

**Simple Explanation:**
A database is like an Excel spreadsheet that your application can read and write to automatically. Instead of one big file, it has multiple tables (like sheets in Excel).

**Our Database:**
- **Name:** `myapp_db`
- **Type:** MySQL 8
- **Location:** Docker container (localhost:3306)
- **Tables:** `users`, `posts`, `products`

---

## 📊 Database Structure

### Current Tables

```
myapp_db (Database)
├── users         (5 records)
├── posts         (7 records)
└── products      (sample table)
```

---

## 👥 Users Table

Stores information about users.

### Structure

| Column     | Type         | Description              |
|------------|--------------|--------------------------|
| id         | INT          | Unique user ID (auto)    |
| username   | VARCHAR(50)  | User's username          |
| email      | VARCHAR(100) | User's email             |
| created_at | TIMESTAMP    | When user was created    |

### Sample Data

```
+----+---------------+---------------------------+---------------------+
| id | username      | email                     | created_at          |
+----+---------------+---------------------------+---------------------+
|  1 | john_doe      | john.doe@example.com      | 2025-11-01 10:00:00 |
|  2 | jane_smith    | jane.smith@example.com    | 2025-11-02 11:30:00 |
|  3 | bob_wilson    | bob.wilson@example.com    | 2025-11-03 14:15:00 |
|  4 | alice_brown   | alice.brown@example.com   | 2025-11-04 09:45:00 |
|  5 | charlie_davis | charlie.davis@example.com | 2025-11-05 16:20:00 |
+----+---------------+---------------------------+---------------------+
```

### View Users

```bash
# All users
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "SELECT * FROM users;"

# Count users
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "SELECT COUNT(*) FROM users;"

# Specific user
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "SELECT * FROM users WHERE id=1;"
```

---

## 📝 Posts Table

Stores blog posts written by users.

### Structure

| Column     | Type         | Description                |
|------------|--------------|----------------------------|
| id         | INT          | Unique post ID (auto)      |
| user_id    | INT          | Who wrote it (links to users) |
| title      | VARCHAR(255) | Post title                 |
| content    | TEXT         | Post content               |
| created_at | TIMESTAMP    | When posted                |
| updated_at | TIMESTAMP    | Last update time           |

### Relationship

```
users.id ←─── posts.user_id (Foreign Key)
   |              |
   └──────────────┘
   One user can have many posts
```

### Sample Data

```
+----+---------+---------------------------------+
| id | user_id | title                           |
+----+---------+---------------------------------+
|  1 |       1 | Getting Started with Docker     |
|  2 |       1 | MySQL Best Practices            |
|  3 |       2 | Building REST APIs with Express |
|  4 |       3 | Introduction to Node.js         |
|  5 |       4 | Database Design Principles      |
|  6 |       5 | Docker Compose Tutorial         |
|  7 |       2 | Understanding Foreign Keys      |
+----+---------+---------------------------------+
```

### View Posts

```bash
# All posts
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "SELECT id, user_id, title FROM posts;"

# Posts by specific user
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "SELECT * FROM posts WHERE user_id=1;"

# Posts with author names
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "
SELECT p.title, u.username 
FROM posts p 
JOIN users u ON p.user_id = u.id;"
```

---

## 🔗 Understanding Relationships

### Foreign Keys

Posts table has `user_id` that references `users.id`.

**What this means:**
- You can't create a post for a user that doesn't exist
- If you delete a user, their posts are also deleted (CASCADE)

**Example:**
```sql
-- This works (user 1 exists)
INSERT INTO posts (user_id, title, content) 
VALUES (1, 'My Post', 'Content here');

-- This fails (user 999 doesn't exist)
INSERT INTO posts (user_id, title, content) 
VALUES (999, 'My Post', 'Content here');
```

---

## 🎯 Common Operations

### View All Tables

```bash
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "SHOW TABLES;"
```

**Output:**
```
+--------------------+
| Tables_in_myapp_db |
+--------------------+
| posts              |
| products           |
| users              |
+--------------------+
```

### Describe Table Structure

```bash
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "DESCRIBE users;"
```

**Output:**
```
+------------+--------------+------+-----+-------------------+
| Field      | Type         | Null | Key | Default           |
+------------+--------------+------+-----+-------------------+
| id         | int          | NO   | PRI | NULL              |
| username   | varchar(50)  | NO   | UNI | NULL              |
| email      | varchar(100) | NO   | UNI | NULL              |
| created_at | timestamp    | YES  |     | CURRENT_TIMESTAMP |
+------------+--------------+------+-----+-------------------+
```

### Count Records

```bash
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM posts) as total_posts;
"
```

---

## 🔍 Accessing the Database

### Method 1: Docker Command Line

```bash
# Connect to MySQL shell
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db

# Now you're in MySQL prompt
mysql> SELECT * FROM users;
mysql> exit
```

### Method 2: One-Line Queries

```bash
docker exec -it mysql_db mysql -u appuser -puserpassword123 myapp_db -e "YOUR SQL HERE"
```

### Method 3: Database Client (GUI)

You can use tools like:
- **MySQL Workbench** (Free)
- **TablePlus** (Free/Paid)
- **DBeaver** (Free)
- **phpMyAdmin** (Web-based)

**Connection Settings:**
- Host: `localhost`
- Port: `3306`
- Database: `myapp_db`
- Username: `appuser`
- Password: `userpassword123`

---

## 📈 Data Types Explained

### Common Types in Our Tables

| Type         | Description                  | Example                |
|--------------|------------------------------|------------------------|
| INT          | Whole numbers                | 1, 42, 1000            |
| VARCHAR(n)   | Text up to n characters      | "John", "hello@example"|
| TEXT         | Long text                    | Blog post content      |
| DECIMAL(m,n) | Decimal numbers              | 19.99, 100.50          |
| TIMESTAMP    | Date and time                | 2025-11-13 10:30:00    |
| ENUM         | Fixed list of values         | 'pending', 'active'    |

---

## 🛡️ Database Security

### Current Setup (Development)

```
Root User:      root / rootpassword123
App User:       appuser / userpassword123
Database:       myapp_db
```

**⚠️ Important:**
- These are **development** credentials only
- **NEVER** use these in production
- Change passwords for real applications
- Use environment variables (`.env` file)

### User Permissions

The `appuser` has permissions to:
- ✅ SELECT (read data)
- ✅ INSERT (add data)
- ✅ UPDATE (modify data)
- ✅ DELETE (remove data)
- ✅ CREATE (make tables)

---

## 💾 Data Persistence

### Where is Data Stored?

Data is stored in a Docker volume: `fullstacktraining_mysql_data`

```bash
# Check volume
docker volume inspect fullstacktraining_mysql_data
```

### What Happens When...

**You stop the container:**
- ✅ Data is safe
- ✅ Restart and data is still there

**You run `docker-compose down`:**
- ✅ Data is still safe
- ✅ Volume remains

**You run `docker-compose down -v`:**
- ❌ Data is deleted
- ❌ Volume is removed
- ⚠️ Use carefully!

---

## 🎓 What You Learned

- ✅ How databases organize data into tables
- ✅ Structure of users and posts tables
- ✅ What foreign keys are and why they matter
- ✅ How to view database contents
- ✅ Different ways to access the database
- ✅ Common data types
- ✅ How data persistence works

---

**Previous:** ← [Docker Guide](03-docker-guide.md)  
**Next:** [Creating Tables](05-creating-tables.md) →
