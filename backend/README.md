# Xray Node Distribution and Subscription Management System - Backend

This directory contains the backend service for the Xray Node Distribution and Subscription Management System. It is built using Laravel.

Refer to the main [AGENTS.MD](../../AGENTS.MD) in the root directory for the complete project plan and architecture.

## Setup and Installation (Placeholder)

Detailed setup and installation instructions will be added here. This will typically involve:

1.  Cloning the repository.
2.  Navigating to the `backend` directory.
3.  Copying `.env.example` to `.env` and configuring environment variables (database, cache, queue, JWT secret, etc.).
4.  Installing PHP dependencies: `composer install`.
5.  Generating an application key: `php artisan key:generate`.
6.  Running database migrations: `php artisan migrate`.
7.  Running database seeders: `php artisan db:seed` (if applicable).
8.  (Optional) Installing frontend dependencies if any are managed within this part: `npm install && npm run dev`.
9.  Serving the application: `php artisan serve`.

## API Documentation

Comprehensive API documentation is crucial for developers interacting with this backend.

**Status:** Upcoming

**Format:** We plan to use the OpenAPI Specification (formerly Swagger) for documenting all API endpoints. This will likely result in an `openapi.yaml` or `openapi.json` file.

**Accessing Documentation:** Once generated or published, details on how to access the interactive API documentation (e.g., via Swagger UI or Redoc) will be provided here.

**Key Endpoint Categories to be Documented:**
*   Authentication (`/auth/login`, `/auth/register`, `/auth/me`, etc.)
*   Admin User Management (`/admin/users`)
*   Admin User Group Management (`/admin/user-groups`)
*   Admin Plan Management (`/admin/plans`)
*   Admin Node Management (`/admin/nodes`)
*   User Subscription Management (once implemented)

For now, refer to the route definitions in `routes/api.php` and the controller methods for endpoint details.

## Running Tests (Placeholder)

To run the test suite:

```bash
php artisan test
```
