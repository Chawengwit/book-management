# Book Management Application

This is a Node.js + Express web application for managing books and user authentication. It supports user registration, login/logout, book CRUD operations, and image uploads.

---

# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Start the server
npm start

---

## Tech Stack

- Backend: Node.js, Express.js
- Frontend: EJS Templates, SCSS, FontAwesome
- Database: MongoDB (via Mongoose)
- Authentication: JWT, Session-based
- File Upload: Multer (for book images)
- Security: Origin-based CORS validation

## Features

- Register and Login with bcrypt-hashed passwords
- JWT-protected routes
- View paginated list of books
- View book details
- Create new book
- Edit existing book
- Delete book
- Upload cover image
- Responsive UI
- Error and loading state handling
- Easy to extend for unit testing

---

## Book Management Routes

| Route                  | Method | Description               |
|------------------------|--------|---------------------------|
| `/`                    | GET    | Show paginated book list  |
| `/view/:id`            | GET    | View book detail          |
| `/create`              | GET    | Render create book form   |
| `/update/:id`          | GET    | Render edit book form     |
| `/api/create`          | POST   | Create book (with image)  |
| `/api/update/:id`      | POST   | Update book info          |
| `/api/delete-book/:id` | GET    | Delete book               |

## User Routes

| Route            | Method | Description                |
|------------------|--------|----------------------------|
| `/register`      | GET    | Render register form       |
| `/api/register`  | POST   | Register new user          |
| `/login`         | GET    | Render login form          |
| `/api/login`     | POST   | Authenticate user          |
| `/api/logout`    | GET    | Destroy session and logout |

## API Endpoint Details

| Method | Path                   | Description                          | Auth Required | Request Params / Body                                                                         |
|--------|------------------------|--------------------------------------|---------------|-----------------------------------------------------------------------------------------------|
| POST   | /api/register          | Register a new user                  | No            | **Body (JSON):**<br>`email`, `password`, `name`                                               |
| POST   | /api/login             | Authenticate user and start session  | No            | **Body (JSON):**<br>`email`, `password`                                                       |
| POST   | /api/create            | Create a new book with image upload  | Yes (JWT)     | **Form Data (multipart/form-data):**<br>`title`, `author`, `published_year`, `genre`, `image` |
| POST   | /api/update/:id        | Update book details by ID            | Yes (JWT)     | **URL Param:** `id`<br>**Body (JSON):** `title`, `author`, `published_year`, `genre`          |
| GET    | /api/delete-book/:id   | Delete book by ID                    | Yes (JWT)     | **URL Param:** `id`                                                                           |

---

## Future Enhancements

- Unit tests with Mocha, Chai, Supertest
- Code coverage reports
- Expired token handling
- Role-based access control

---
