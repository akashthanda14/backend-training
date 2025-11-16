# User API - Full CRUD Operations

A RESTful API for managing users with complete CRUD operations built with Node.js, Express, and MySQL.

## 🚀 Features

- ✅ **Full CRUD Operations**: Create, Read, Update, and Delete users
- ✅ **MVC Architecture**: Clean separation with Model, Service, Controller layers
- ✅ **Input Validation**: Email format, username validation, and required fields checking
- ✅ **Error Handling**: Proper HTTP status codes and error messages
- ✅ **Docker Support**: Easy setup with Docker Compose
- ✅ **API Documentation**: Interactive Swagger/OpenAPI documentation
- ✅ **Automated Tests**: Comprehensive test suite for all endpoints
- ✅ **Postman Guide**: Step-by-step testing instructions

## 📋 Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose (recommended)
- OR MySQL 8.0+ running locally

## 🛠️ Quick Setup

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/akashthanda14/backend-training.git
   cd backend-training
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MySQL with Docker**
   ```bash
   docker-compose up -d
   ```
   This will:
   - Start MySQL container
   - Create database and users table
   - Insert sample data

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Access the API**
   - Server: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

### Option 2: Using Local MySQL

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a `.env` file**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=myapp_db
   DB_PORT=3306
   PORT=3000
   ```

3. **Initialize the database**
   - Run the SQL in `init.sql` to create the database and tables
   - Or import from MySQL Workbench/CLI

4. **Start the server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user (full or partial) |
| DELETE | `/users/:id` | Delete user |

## 🧪 Testing

### Automated Tests
Run the comprehensive test suite:
```bash
node test.js
```

This will test:
- ✅ Health check
- ✅ Get all users
- ✅ Get user by ID (valid, invalid, non-existent)
- ✅ Create user (valid, invalid email, missing fields, duplicates)
- ✅ Update user (full, partial, non-existent)
- ✅ Delete user (valid, non-existent)

### Manual Testing with curl

**Get all users:**
```bash
curl http://localhost:3000/users
```

**Get user by ID:**
```bash
curl http://localhost:3000/users/1
```

**Create new user:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username":"new_user","email":"newuser@example.com"}'
```

**Update user:**
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"email":"updated@example.com"}'
```

**Delete user:**
```bash
curl -X DELETE http://localhost:3000/users/6
```

### Testing with Postman
See the detailed guide in [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) for step-by-step instructions.

## 📖 API Documentation

### Interactive Swagger UI
Visit http://localhost:3000/api-docs when the server is running to access interactive API documentation where you can:
- View all endpoints
- See request/response schemas
- Try out API calls directly from the browser
- View example responses

### Swagger/OpenAPI Spec
The complete API specification is available in [swagger.yaml](swagger.yaml)

## 🗂️ Project Structure

```
Aschik_project/
├── src/
│   ├── controller/
│   │   └── userController.js    # HTTP request handlers
│   ├── service/
│   │   └── userService.js       # Business logic & validation
│   ├── model/
│   │   └── userModel.js         # Database queries
│   ├── routes/
│   │   └── userRoutes.js        # Route definitions
│   ├── db/
│   │   └── db.js                # Database connection
│   └── server.js                # Express app setup
├── docs/                        # Documentation
├── migrations/                  # Database migrations
├── docker-compose.yml           # Docker setup
├── init.sql                     # Database initialization
├── test.js                      # Automated tests
├── swagger.yaml                 # API documentation
├── POSTMAN_GUIDE.md            # Postman testing guide
└── package.json
```

## 🏗️ Architecture

This project follows the **MVC (Model-View-Controller)** pattern with an additional Service layer:

- **Routes** → Define API endpoints
- **Controller** → Handle HTTP requests/responses
- **Service** → Business logic and validation
- **Model** → Database operations
- **DB** → MySQL connection pool

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
);
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=myapp_db
DB_PORT=3306
PORT=3000
```

## 📦 Available Scripts

```bash
# Start server (development with auto-reload)
npm run dev

# Start server (production)
npm start

# Run tests
node test.js

# Start Docker containers
docker-compose up -d

# Stop Docker containers
docker-compose down

# Reset database (remove volumes)
docker-compose down -v
```

## 🐛 Troubleshooting

**Problem**: Cannot connect to database
- **Solution**: Make sure Docker is running: `docker-compose up -d`
- Check `.env` file has correct credentials

**Problem**: Port 3000 already in use
- **Solution**: Kill the process: `lsof -ti:3000 | xargs kill -9`
- Or change PORT in `.env` file

**Problem**: Database errors
- **Solution**: Reset the database:
  ```bash
  docker-compose down -v
  docker-compose up -d
  ```

## 📝 Sample API Responses

### Get All Users
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john.doe@example.com",
      "created_at": "2025-11-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Create User
```json
{
  "success": true,
  "data": {
    "id": 6,
    "username": "new_user",
    "email": "newuser@example.com",
    "created_at": "2025-11-17T10:30:00.000Z"
  },
  "message": "User created successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "User not found"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Akash Thanda**
- GitHub: [@akashthanda14](https://github.com/akashthanda14)

## 🙏 Acknowledgments

- Express.js for the web framework
- MySQL for the database
- Docker for containerization
- Swagger UI for API documentation
