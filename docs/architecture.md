# Architecture Design

## Overview
OpsVault follows a simple, monolithic 3-tier web application architecture designed for maintainability, ease of deployment, and logical separation between frontend and backend.

## Components

### 1. Frontend
*   **Framework:** React
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Role:** Provides a fast, responsive user interface for searching, viewing, and documenting problems. Communicates with the backend via REST API.

### 2. Backend
*   **Framework:** FastAPI
*   **Language:** Python
*   **Data Validation:** Pydantic
*   **ORM:** SQLAlchemy
*   **Role:** Handles business logic, authentication, authorization, validation, and database operations. Exposes a REST API to the frontend.

### 3. Database
*   **Engine:** PostgreSQL
*   **Role:** Persistent storage for users, projects, problems, fixes, and tags. Facilitates full-text search capabilities for V1.
*   **Migrations:** Managed using Alembic to ensure reproducible schema changes.

## Infrastructure & Deployment
*   **Local Development:** Docker and Docker Compose. The entire stack (frontend, backend, database) can be spun up using `docker compose up`.
*   **No Microservices:** The application is intentionally designed as a monolith. Tools like Redis, Kafka, Kubernetes, or Elasticsearch are excluded from V1 to reduce operational complexity.

## Data Flow
1.  **User Action:** User interacts with the React Frontend (e.g., searches for a problem).
2.  **API Request:** Frontend sends an HTTP request (with HTTP-only session cookie) to the FastAPI Backend.
3.  **Processing:** Backend validates the session, checks authorization, and processes the request.
4.  **Database Query:** Backend queries PostgreSQL using SQLAlchemy.
5.  **Response:** PostgreSQL returns data to the backend, which serializes it using Pydantic and returns JSON to the frontend.
6.  **UI Update:** Frontend updates the UI based on the response.
