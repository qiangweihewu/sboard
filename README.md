# sboard
Simple subscription distribution system for multiple nodes generated via 3x-ui panel.

This repository now contains a Laravel backend skeleton in the `backend/` directory.
An initial API for managing nodes is available at `/api/nodes`.
Authentication endpoints (`/api/register`, `/api/login`) issue Sanctum tokens.
Authenticated users can manage nodes, user groups and plans via REST APIs.
