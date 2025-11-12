# Cafe Backend

A Node.js backend for the Cafe application with user authentication and MySQL database.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Make sure MySQL is running on your system
2. Create the database and tables:
```bash
mysql -u root -p < database.sql
```

### 3. Environment Variables
Create a `.env` file in the root directory with:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cafeapp
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=development
```

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

## Database Schema

The `users` table includes:
- id (auto-increment primary key)
- name (required)
- email (required, unique)
- password (required, hashed)
- age (optional)
- gender (optional)
- city (optional)
- address (optional)
- created_at (auto-timestamp)
- updated_at (auto-timestamp)

## Features
- User registration and login
- Password hashing with bcrypt
- JWT token authentication
- MySQL database integration
- CORS enabled
- Input validation
