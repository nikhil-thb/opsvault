# Development Plan

The development of OpsVault V1 will follow a strict, phased approach to ensure stability, security, and incremental value delivery.

## Phase 1 — Foundation
**Goal:** Establish the base repository, infrastructure, and "Hello World" connectivity.
*   Initialize Git repository structure.
*   Create Docker Compose setup (`docker-compose.yml`) for Frontend, Backend, and PostgreSQL.
*   Setup FastAPI base application and React/Vite base application.
*   Configure environment variables (`.env.example`).
*   Establish database connection using SQLAlchemy.
*   Setup Alembic for database migrations.
*   Implement a basic `/health` endpoint to verify connectivity.
*   **Validation:** Frontend, backend, and DB start cleanly. Migrations run successfully.

## Phase 2 — Authentication
**Goal:** Secure the application and implement user management foundations.
*   Create `users` database table and model.
*   Implement Argon2id PIN hashing.
*   Create login, logout, and session management logic (HTTP-only cookies).
*   Implement the `/api/auth/me` endpoint.
*   Implement "Change PIN" functionality.
*   Add brute-force login protection.
*   **Validation:** Automated tests for valid/invalid logins, session expiration, and PIN changes.

## Phase 3 — Projects
**Goal:** Allow the categorization of knowledge by project/system.
*   Create `projects` database table and model.
*   Implement CRUD APIs for projects (Admin restricted for creation/modification).
*   Build frontend views: Project listing, Project detail.
*   **Validation:** Automated tests for project CRUD and authorization checks.

## Phase 4 — Problems and Fixes
**Goal:** Implement the core knowledge base functionality.
*   Create `problems`, `fixes`, `tags`, and `problem_tags` tables/models.
*   Implement CRUD APIs for problems and fixes.
*   Build frontend views: Create Problem, Edit Problem, Comprehensive Problem Detail view.
*   Implement markdown rendering for long text fields in the UI.
*   **Validation:** Automated tests for problem/fix creation, updating, and retrieval.

## Phase 5 — Search
**Goal:** Enable quick discovery of knowledge.
*   Implement backend search logic utilizing PostgreSQL (searching across titles, descriptions, investigation, root cause, and fixes).
*   Create the `/api/search` endpoint with filtering capabilities.
*   Build the frontend search interface and results view.
*   **Validation:** Verify search returns relevant results even when terms are buried in a fix description.

## Phase 6 — Dashboard
**Goal:** Provide a useful landing page.
*   Implement backend endpoints for dashboard statistics.
*   Build the frontend dashboard showing counts, recent problems, and the prominent search bar.

## Phase 7 — Admin
**Goal:** Provide management tools for organization administrators.
*   Build `/admin/users` view to list, enable/disable, and reset PINs.
*   Build `/admin/projects` view for centralized project management.
*   Ensure all admin actions are rigorously protected by backend role checks.

## Phase 8 — Security Review
**Goal:** Ensure the application is safe for internal deployment.
*   Audit authentication and authorization flows.
*   Verify no plaintext PINs are logged or stored.
*   Check for XSS vulnerabilities (especially in Markdown rendering) and SQL injection.
*   Review CORS and Cookie configurations.
*   Document findings and apply fixes.

## Phase 9 — Final Validation
**Goal:** Prepare for V1 release.
*   Run the complete automated test suite (backend & frontend).
*   Perform manual QA from a clean environment (`docker compose down -v` -> `docker compose up --build`).
*   Verify seed data works as expected.
*   Finalize `README.md` with complete setup and usage instructions.
