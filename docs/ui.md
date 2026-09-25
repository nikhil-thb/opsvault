# UI & Page Structure Design

## Overview
The UI will be built with React and TypeScript, focusing on speed, readability, and information density. It should feel like a utilitarian engineering tool, not a marketing website.

## Core Layout
*   **Top Navigation / Sidebar:** Links to Dashboard, Projects, Problems, Search, and User Profile. If ORG_ADMIN, shows Admin section.
*   **Main Content Area:** Displays the current page content.

## Pages

### 1. `/login`
*   Form: Username input, 4-digit PIN input (masked), Login button.
*   Shows generic error messages on failure.

### 2. `/dashboard`
*   **Stats:** Quick counts of Projects, Problems, Resolved Problems, Users.
*   **Global Search Bar:** Prominent search input for finding problems across the entire base.
*   **Recent Activity:** List of recently created or updated problems.

### 3. `/projects`
*   List/Grid of active projects.
*   Displays Project Name, Technology, and Status.
*   Admin users see a "Create Project" button.

### 4. `/projects/:id`
*   Project Details: Name, Description, Technology, Repository URL, Status.
*   **Problems List:** A filtered list of problems specifically related to this project.
*   "Add Problem" button scoped to this project.

### 5. `/problems`
*   Paginated/Infinite scroll list of all problems.
*   Filters for Project, Environment, Category, Status, and Tags.

### 6. `/problems/new`
*   Form to create a new problem.
*   Fields: Title, Project (dropdown), Environment (dropdown), Category (dropdown), Status (dropdown).
*   Markdown Textareas: "What happened?", Investigation, Root Cause, Fix, Commands, Configuration Changes, Notes.
*   Tags input.

### 7. `/problems/:id`
*   The single, comprehensive view for a problem.
*   Header: Title, Project, Environment, Category, Status.
*   Body: Renders the problem description, investigation, root cause.
*   Fixes Section: Lists all associated fixes with their descriptions, commands, and notes.
*   Tags Section.
*   Actions: Edit Problem, Add Fix.

### 8. `/problems/:id/edit`
*   Form to update an existing problem's details.

### 9. `/profile`
*   Displays user information (Username, Role).
*   **Change PIN Form:** Current PIN, New PIN, Confirm New PIN.

### 10. `/admin/users` (Admin Only)
*   Table of users: Username, Role, Status, Actions.
*   Actions: Enable/Disable, Reset PIN.
*   "Add User" button and modal/form.

### 11. `/admin/projects` (Admin Only)
*   Table of projects.
*   Actions: Edit, Archive.

## Design Principles
*   **Markdown Rendering:** Use a library to safely render markdown for long text fields, supporting code blocks.
*   **Copy Commands:** Provide "Copy to clipboard" buttons for code blocks and command sections.
*   **Clear Status Indicators:** Use simple color-coding (e.g., Green for Resolved, Red for Open/Investigating) without excessive flair.
*   **Responsive:** Ensure basic usability on smaller screens, though desktop is the primary target.
