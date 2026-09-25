# Database Design

## Database Engine
**PostgreSQL** is the chosen database engine, leveraging its robust relational features and built-in text search capabilities.

## Schema Overview

### 1. `users`
*   `id` (UUID/Int, Primary Key)
*   `username` (String, Unique, Indexed)
*   `pin_hash` (String) - Hashed with Argon2id
*   `role` (Enum/String: 'ORG_ADMIN', 'USER')
*   `is_active` (Boolean, Default: True)
*   `last_login_at` (Timestamp, Nullable)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### 2. `projects`
*   `id` (UUID/Int, Primary Key)
*   `name` (String)
*   `description` (Text, Nullable)
*   `technology` (String, Nullable)
*   `repository_url` (String, Nullable)
*   `status` (Enum/String: 'ACTIVE', 'ARCHIVED')
*   `created_by` (Foreign Key -> `users.id`)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### 3. `problems`
*   `id` (UUID/Int, Primary Key)
*   `project_id` (Foreign Key -> `projects.id`)
*   `title` (String, Indexed for search)
*   `description` (Text, Indexed for search) - "What happened?"
*   `environment` (String)
*   `category` (String)
*   `status` (Enum/String: 'OPEN', 'INVESTIGATING', 'RESOLVED', 'KNOWN_ISSUE', 'ARCHIVED')
*   `investigation` (Text, Nullable, Indexed for search)
*   `root_cause` (Text, Nullable, Indexed for search)
*   `created_by` (Foreign Key -> `users.id`)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### 4. `fixes`
*   `id` (UUID/Int, Primary Key)
*   `problem_id` (Foreign Key -> `problems.id`)
*   `description` (Text, Indexed for search)
*   `commands` (Text, Nullable)
*   `configuration_changes` (Text, Nullable)
*   `notes` (Text, Nullable)
*   `created_by` (Foreign Key -> `users.id`)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### 5. `tags`
*   `id` (UUID/Int, Primary Key)
*   `name` (String, Unique)

### 6. `problem_tags` (Join Table)
*   `problem_id` (Foreign Key -> `problems.id`)
*   `tag_id` (Foreign Key -> `tags.id`)
*   *(Composite Primary Key on problem_id, tag_id)*

## Relationships
*   **Users to Projects/Problems/Fixes:** One-to-Many (Ownership).
*   **Projects to Problems:** One-to-Many.
*   **Problems to Fixes:** One-to-Many.
*   **Problems to Tags:** Many-to-Many (via `problem_tags`).

## Search Optimization
PostgreSQL's native `tsvector` and `tsquery` (or simple `ILIKE` for V1 depending on complexity) will be used to search across `problems.title`, `problems.description`, `problems.investigation`, `problems.root_cause`, and `fixes.description`.

## Migrations
All schema changes will be managed using **Alembic**. Manual schema modifications are prohibited.
