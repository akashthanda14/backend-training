# User API (MCSR) - Quick Start

Prerequisites
- Node.js 16+ and npm
- MySQL running locally or accessible via connection string

Setup
1. Install dependencies

```bash
npm install
```

2. Create a `.env` file (use `.env.example` if present)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=myapp_db
DB_PORT=3306
PORT=3000
```

3. Ensure the `users` table exists and insert sample rows. Use the SQL in `ASSIGNMENT.md`.

Run the app (development)

```bash
npm run dev
```

Endpoints
- GET /users — list users
- GET /users/:id — get single user

Test quickly with curl

```bash
curl http://localhost:3000/users
curl http://localhost:3000/users/1
```

If you want, I can add a Postman collection and a seed SQL file to the repo.
