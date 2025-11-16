# Assignment: Build User API with MCSR Architecture

## Objective
Create a RESTful API endpoint to fetch user data from a MySQL database using the **MCSR (Model-Controller-Service-Routes)** architecture pattern.

---

## 📋 Assignment Overview

# Assignment: Build /users API (MCSR)

## Objective
Implement a small backend that exposes two endpoints to read user data using the MCSR (Model → Controller → Service → Routes) structure. The project already contains a starter scaffold; update or implement missing pieces.

Endpoints to implement and test:
- GET /users — returns all users
- GET /users/:id — returns a single user by id

## Short Tasks

1) Ensure the database connection module exists and exports a `query(sql, params)` helper.
2) Implement `model/userModel.js` with `getAllUsers()` and `getUserById(id)`.
3) Implement `service/userService.js` with `listUsers()` and `getUserById(id)`.
4) Implement `controller/userController.js` with `getUsers(req,res)` and `getUserById(req,res)`.
5) Wire `routes/userRoutes.js` to expose the two GET routes and mount at `/users` in `server.js` or `src/index.js`.

## Quick DB schema (for local testing)
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email) VALUES
  ('john_doe', 'john@example.com'),
  ('jane_smith', 'jane@example.com');
```

## Testing (Postman / curl)

Fetch all users

Request
- Method: GET
- URL: http://localhost:3000/users

Expected: 200 OK with JSON body:
```json
{ "success": true, "data": [ /* users */ ], "count": <number> }
```

Fetch single user

Request
- Method: GET
- URL: http://localhost:3000/users/1

Expected: 200 OK with JSON body:
```json
{ "success": true, "data": { /* user */ } }
```
If user not found: 404 with { "success": false, "error": "User not found" }

## Required packages
```
npm install express mysql2 dotenv cors
npm install -D nodemon
```

## Environment (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=myapp_db
DB_PORT=3306
PORT=3000
```

## Rubric (quick)
- Architecture & structure: 30 pts
- Endpoint behavior & error handling: 40 pts
- Code quality: 20 pts
- Test evidence (Postman screenshots or curl output): 10 pts

## Submission
- Project folder (zipped)
- README with run instructions
- Optional: SQL dump or a short note how to seed the DB

---

If you want, I can also:
- Add a small Postman collection file to the repo
- Add a sample SQL seed file
- Add a short `README.md` with run instructions (I will add it next)
