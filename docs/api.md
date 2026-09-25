# API Design

## Overview
The backend exposes a RESTful API using FastAPI. All endpoints (except login) require a valid authenticated session.

## Base URL
`/api`

## Endpoints

### Authentication (`/api/auth`)
*   `POST /auth/login`
    *   Body: `{"username": "...", "pin": "..."}`
    *   Action: Validates credentials, sets HTTP-only secure cookie, returns user context.
*   `POST /auth/logout`
    *   Action: Clears the session cookie.
*   `GET /auth/me`
    *   Action: Returns the currently authenticated user's information.
*   `POST /auth/change-pin`
    *   Body: `{"current_pin": "...", "new_pin": "..."}`
    *   Action: Updates the user's PIN.

### Users (`/api/users`) - *Requires ORG_ADMIN role for most*
*   `GET /users` - List all users.
*   `POST /users` - Create a new user.
*   `GET /users/{id}` - Get user details.
*   `PUT /users/{id}` - Update user role/details.
*   `POST /users/{id}/reset-pin` - Admin reset of a user's PIN.
*   `POST /users/{id}/disable` - Disable a user.
*   `POST /users/{id}/enable` - Enable a user.

### Projects (`/api/projects`)
*   `GET /projects` - List projects (supports filtering).
*   `POST /projects` - Create a project (Admin only).
*   `GET /projects/{id}` - Get project details.
*   `PUT /projects/{id}` - Update project (Admin only).
*   `POST /projects/{id}/archive` - Archive a project (Admin only).

### Problems (`/api/problems`)
*   `GET /problems` - List problems (supports filtering by project, status, etc.).
*   `POST /problems` - Create a new problem.
*   `GET /problems/{id}` - Get comprehensive problem details (including fixes and tags).
*   `PUT /problems/{id}` - Update problem details.
*   `POST /problems/{id}/archive` - Archive a problem.

### Fixes (`/api/fixes`)
*   `POST /problems/{id}/fixes` - Add a fix to a problem.
*   `PUT /fixes/{id}` - Update an existing fix.
*   `DELETE /fixes/{id}` - Remove a fix.

### Tags (`/api/tags`)
*   `GET /tags` - List available tags.
*   `POST /tags` - Create a new tag.

### Search (`/api/search`)
*   `GET /search`
    *   Query Params: `q` (search string), `project_id`, `environment`, `category`, `status`, `tags`.
    *   Action: Returns matching problems based on keyword search across problem fields and associated fixes.

## Error Handling
The API will return standard HTTP status codes:
*   `200 OK` / `201 Created`
*   `400 Bad Request` (Validation errors)
*   `401 Unauthorized` (Not logged in or invalid credentials)
*   `403 Forbidden` (Insufficient permissions, e.g., not an Admin)
*   `404 Not Found`
*   `500 Internal Server Error` (Generic message, no stack traces exposed)
