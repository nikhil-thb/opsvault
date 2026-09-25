# Authentication & Security Design

## Overview
OpsVault uses a simple, secure, internal authentication mechanism relying on a username and a 4-digit PIN.

## 1. Credentials
*   **Username:** Unique identifier for the user.
*   **PIN:** Exactly 4 numeric digits.
*   **Storage:** PINs are NEVER stored as plaintext. They are hashed using a secure algorithm (Argon2id) before being saved to the database.

## 2. Session Management
*   **Mechanism:** After successful validation of the username and PIN, the backend creates an authenticated session.
*   **Cookie:** The session identifier is sent to the client as an `HttpOnly`, `Secure`, and `SameSite` cookie.
*   **Client-Side:** The frontend relies on the presence of this cookie for subsequent requests. It does not store credentials or session tokens in `localStorage`.
*   **Expiration:** Sessions will have a configurable expiration time, requiring re-authentication after a period of inactivity.

## 3. Rate Limiting & Brute-Force Protection
Since a 4-digit PIN only has 10,000 possible combinations, brute-force protection is critical.
*   **Failed Attempts:** Track failed login attempts per username and IP.
*   **Lockout:** Implement an exponential backoff or temporary lockout after a set number of failed attempts (e.g., 5 attempts).
*   **Generic Responses:** Login endpoints will return a generic "Invalid username or PIN." message to prevent user enumeration.

## 4. Authorization & Roles
OpsVault supports two roles:
*   **USER:** Can view all knowledge, create problems/fixes, edit their own content, and change their own PIN.
*   **ORG_ADMIN:** Has all USER privileges, plus the ability to manage users (create, disable, reset PINs) and manage projects.
*   **Enforcement:** Authorization is enforced on the backend for every protected API route. Frontend UI toggles (hiding admin buttons) are only for UX, not security.

## 5. Security Best Practices
*   Input validation on all API endpoints using Pydantic.
*   Protection against SQL Injection via SQLAlchemy ORM.
*   Protection against XSS by sanitizing rendered Markdown in the frontend.
*   No secrets, API keys, or credentials committed to source control (use `.env`).
*   No sensitive information (PINs, session tokens) written to application logs.
*   No stack traces or database errors exposed to end users.
