# Book Management Application

This is a Node.js + Express web application for managing books and user authentication. It supports user registration, login/logout, book CRUD operations, and image uploads.

---

## Features

- User registration and login with hashed passwords and JWT-based authentication.
- Create, read, update, and delete (CRUD) books.
- Image upload for book covers using `multer`.
- Pagination support on the home page to browse books.
- Views rendered with EJS templating engine.
- Session management for logged-in users.
- Route protection via JWT verification middleware.

---

## API Routes

### Frontend Routes

| Method | Path           | Description                                  | Auth Required | Request Params / Body                         |
|--------|----------------|----------------------------------------------|---------------|----------------------------------------------|
| GET    | `/`            | Home page: paginated list of books           | Yes           | Query: `page` (default 1), `limit` (default 4) |
| GET    | `/register`    | Render user registration form                 | No            | None                                         |
| GET    | `/view/:id`    | View book detail by book ID                    | Yes           | URL param: `id`                              |
| GET    | `/create`      | Render form to create a new book               | Yes           | None                                         |
| GET    | `/update/:id`  | Render form to update book by ID               | Yes           | URL param: `id`                              |

### Backend Routes

| Method | Path               | Description                                   | Auth Required | Request Params / Body                                 |
|--------|--------------------|-----------------------------------------------|---------------|------------------------------------------------------|
| GET    | `/login`           | Render login form                             | No            | None                                                 |
| POST   | `/user/login`      | Handle user login                            | No            | Body: `{ email, password }`                          |
| GET    | `/user/logout`     | Logout user by destroying session           | Yes           | None                                                 |
| POST   | `/user/register`   | Register a new user                          | No            | Body: `{ email, password, ...other user fields }`   |
| GET    | `/delete-book/:id` | Delete a book by ID                          | Yes           | URL param: `id`                                      |
| POST   | `/get-detail`      | Create a new book with image upload          | Yes           | Multipart form-data: `image` (file), plus book fields |
| POST   | `/update-detail/:id`| Update book details by ID                     | Yes           | URL param: `id`; Body: `{ title, author, published_year, genre }` |

---

## Image Upload

- Book images are uploaded via `/get-detail` POST route.
- Images are stored under `/public/images/book-storage`.
- Filenames are prefixed with timestamp for uniqueness.

---
