# Project Architecture & Data Access Overview


---


---

## RBAC (Role-Based Access Control)
- **Roles:** super_admin, division_admin, district_admin, upazila_admin, union_admin, village_admin
- **Access Scope:** Each user has an `accessScope` (e.g., division_id, district_id, etc.)
- **Enforcement:**
  - **Client:** UI components and hooks filter data/actions based on user role and scope
  - **Server:** Firestore security rules strictly enforce RBAC for all reads/writes

---

## Data Access
- **Firestore:**
  - Voters, users, SMS campaigns, etc. are stored in Firestore collections
  - Queries are always filtered by location scope and role
  - Composite indexes are used for efficient queries
- **Local JSON:**
  - Bangladesh administrative data (divisions, districts, etc.) is loaded from static JSON in `public/data/`
  - Used for dropdowns, filtering, and location-based logic
- **Hooks:**
  - `useLocationData`, `useOptimizedLocationData`: Efficiently load and cache location data
  - `useAuth`: Handles authentication state, user profile, and RBAC context

---

## Authentication & User Profiles
- **Auth:** Firebase Auth (email/password)
- **User Profiles:**
  - Stored in Firestore `/users/{uid}`
  - Includes role, accessScope, approval status, etc.
  - `useAuth` hook provides current user and profile throughout the app
- **Registration:**
  - New users register and are pending approval by higher-level admins
  - Approval and verification are managed via RBAC

---
RBAC (Role-Based Access Control)
Roles: super_admin, division_admin, district_admin, upazila_admin, union_admin, village_admin
Access Scope: Each user has an accessScope (e.g., division_id, district_id, etc.)
Enforcement:
Client: UI components and hooks filter data/actions based on user role and scope
Server: Firestore security rules strictly enforce RBAC for all reads/writes

---
Data Access
Firestore:
Voters, users, SMS campaigns, etc. are stored in Firestore collections
Queries are always filtered by location scope and role
Composite indexes are used for efficient queries
Local JSON:
Bangladesh administrative data (divisions, districts, etc.) is loaded from static JSON in public/data/
Used for dropdowns, filtering, and location-based logic
Hooks:
useLocationData, useOptimizedLocationData: Efficiently load and cache location data
useAuth: Handles authentication state, user profile, and RBAC context
Authentication & User Profiles
Auth: Firebase Auth (email/password)
User Profiles:
Stored in Firestore /users/{uid}
Includes role, accessScope, approval status, etc.
useAuth hook provides current user and profile throughout the app
Registration:
New users register and are pending approval by higher-level admins
Approval and verification are managed via RBAC
erformance:
Firestore reads are minimized by using local JSON and optimized queries
React Query caches server data
Security:
All sensitive actions are double-checked in Firestore security rules
Extensibility:
New roles, menu items, or data sources can be added with minimal changes



---

## Other Notes
- **Performance:**
  - Firestore reads are minimized by using local JSON and optimized queries
  - React Query caches server data
- **Security:**
  - All sensitive actions are double-checked in Firestore security rules
- **Extensibility:**
  - New roles, menu items, or data sources can be added with minimal changes

---

For more details, see the codebase and Firestore security rules. 