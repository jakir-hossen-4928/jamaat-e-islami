# Project Overview: Voter Management System

This document provides a comprehensive overview of the Voter Management System, a web application designed for efficient and secure management of voter data. The system features a sophisticated role-based access control (RBAC) mechanism, location-based data scoping, and a structured data model for both voters and users.

## 1. Role-Based Access Control (RBAC)

The application employs a hierarchical RBAC model to ensure that users can only access and manage data relevant to their administrative level. The roles are defined in a descending order of authority:

1.  **Super Admin (`super_admin`)**: Has unrestricted access to all system features and data.
2.  **Division Admin (`division_admin`)**: Manages data for a specific division.
3.  **District Admin (`district_admin`)**: Manages data for a specific district.
4.  **Upazila Admin (`upazila_admin`)**: Manages data for a specific upazila.
5.  **Union Admin (`union_admin`)**: Manages data for a specific union.
6.  **Village Admin (`village_admin`)**: Manages data for a specific village.

Permissions for each role are defined in `src/lib/rbac.ts` and enforced through Firestore security rules in `firestore.rules`.

### Key RBAC Features:

*   **Hierarchical Permissions**: Higher-level admins can manage users and data within their jurisdiction (e.g., a Division Admin can manage District Admins within their division).
*   **Scoped Data Access**: Users can only view and manage voters within their assigned geographical area.
*   **User Verification**: Admins can verify and approve new users within their hierarchical and geographical scope.

## 2. Voter Data Entry

Voter data can be added to the system in two ways:

1.  **Single Voter Entry**: A form-based interface for adding individual voters.
2.  **Bulk CSV Upload**: Allows for the efficient import of multiple voters from a CSV file.

### Single Voter Entry (`src/adminDashboard/AddVoters.tsx`)

The `AddVoters.tsx` component provides a user-friendly form for entering detailed information about a single voter.

*   **Dynamic Form**: The form includes a "Column Settings" feature that allows users to customize which fields are visible, saving their preferences in `localStorage`.
*   **Location Scoping**:
    *   **Super Admins** must select the voter's full location (division, district, upazila, etc.).
    *   **Other admins** have their location pre-filled based on their `accessScope`, ensuring data is correctly associated with their area of responsibility.
*   **Data Validation**: The system performs client-side validation to ensure that required fields, such as "Voter Name," are filled before submission.

### Bulk Voter Upload (`src/adminDashboard/BulkVoterUpload.tsx`)

For large-scale data entry, the system supports uploading a CSV file. This feature is designed to streamline the process of migrating existing voter lists into the application.

## 3. Location-Scoped Data Retrieval

The system's core strength is its ability to filter and display data based on a user's role and location.

### How it Works:

1.  **User `accessScope`**: Each user in the `users` collection has an `accessScope` object that defines their geographical area of responsibility (e.g., `{ division_id: '1', district_id: '1' }`).
2.  **Firestore Security Rules**: The `firestore.rules` file contains a `canAccessLocation` function that checks if a user's `accessScope` matches the location data of a voter document. This ensures that users can only read voter data that falls within their assigned area.
3.  **Client-Side Filtering (`useLocationFilter` hook)**: The `useLocationFilter` hook (`src/hooks/useLocationFilter.tsx`) provides client-side logic for filtering voter data.
    *   It fetches the user's profile and `accessScope`.
    *   It provides a `filterVoters` function that returns only the voters a user is permitted to see.
    *   For Super Admins, it allows for interactive filtering by division, district, etc.

## 4. Data Structures

The application relies on two primary data models: `User` and `VoterData`.

### User Data Structure (`src/lib/types.ts`)

The `User` interface defines the structure of a user document in the Firestore `users` collection.


export interface VoterData {
  id?: string; // Firestore Document ID
  ID: string;

  // Personal Info
  'Voter Name': string;
  FatherOrHusband?: string;
  Age?: number;
  Gender?: 'Male' | 'Female' | 'Other';
  'Marital Status'?: 'Married' | 'Unmarried' | 'Widowed' | 'Divorced';
  Student?: 'Yes' | 'No';
  Occupation?: string;
  Education?: string;
  Religion?: string;

  // Contact Info
  Phone?: string;
  NID?: string;

  // Voting Info
  'Will Vote'?: 'Yes' | 'No';
  'Voted Before'?: 'Yes' | 'No';
  'Vote Probability (%)'?: number; // Should be a number between 10 and 100

  'Political Support'?: string;

  // Special Conditions
  'Has Disability'?: 'Yes' | 'No';
  'Is Migrated'?: 'Yes' | 'No';

  // Location (normalized IDs)
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;

  // Location Names (for display)
  'Village Name'?: string;

  // Metadata
  'House Name'?: string;
  Remarks?: string;
  Collector?: string;
  'Collection Date'?: string;
  'Last Updated'?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'super_admin' | 'division_admin' | 'district_admin' | 'upazila_admin' | 'union_admin' | 'village_admin';
  approved: boolean;
  createdAt: string;
  lastLogin?: string;
  // Location-based access scope - defines what areas user can access
  accessScope: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    village_id?: string; // Added village_id
    // Location names for display
    division_name?: string;
    district_name?: string;
    upazila_name?: string;
    union_name?: string;
    village_name?: string; // Added village_name
  };
  // Assigned by role hierarchy
  assignedBy?: string; // UID of the admin who assigned this role
  verifiedBy?: string; // UID of the admin who verified this user
}
### Voter Data Structure (`src/lib/types.ts`)

The `VoterData` interface defines the structure of a voter document in the Firestore `voters` collection.

```typescript
export interface VoterData {
  id?: string; // Firestore Document ID
  ID: string;

  // Personal Info
  'Voter Name': string;
  FatherOrHusband?: string;
  Age?: number;
  // ... other personal fields

  // Location (normalized IDs)
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;

  // Metadata
  Collector?: string;
  'Collection Date'?: string;
  'Last Updated'?: string;
}
```

## 5. Conclusion

This Voter Management System is a robust and secure platform for managing voter information. Its key strengths lie in its granular role-based access control, location-based data scoping, and well-defined data models. These features ensure data integrity and allow for efficient management of voter data across different administrative levels.

## 6. Prompt for Lovable.dev AI

This section provides a detailed prompt for an AI developer, like lovable.dev, to recreate this Voter Management System with enhanced security and a specific user management workflow.

### Prompt:

"Build a secure, multi-tenant web application for managing voter data with the following detailed requirements:

**1. Brand Identity:**

*   **Logo:** Use the following logo throughout the application: `https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png`

**2. Technology Stack:**

*   **Frontend:** React with TypeScript, Vite for bundling, and Tailwind CSS.
*   **Backend:** Firebase (Firestore for the database, Firebase Authentication for user management).
*   **UI Components:** Utilize the `shadcn/ui` component library to ensure a modern, consistent, and accessible user interface.

**3. Core Architecture & Features:**

*   **Authentication & User Management:**
    *   **Login Page:** The application should only have a public-facing login page. There will be no self-service sign-up option for users.
    *   **Hierarchical User Creation:** User accounts must be created by existing administrators in a top-down manner. The creation hierarchy is as follows:
        *   A `super_admin` can create `division_admin` users and assign them to a specific division.
        *   A `division_admin` can create `district_admin` users within their assigned division.
        *   A `district_admin` can create `upazila_admin` users within their assigned district.
        *   An `upazila_admin` can create `union_admin` users within their assigned upazila.
        *   A `union_admin` can create `village_admin` users within their assigned union.
    *   When an admin creates a new user, they will define the user's role and their specific location scope (e.g., which division, district, etc.).

*   **Role-Based Access Control (RBAC):**
    *   Implement a strict, hierarchical RBAC system based on the user's role and their assigned `accessScope`.
    *   Users must only be able to view or manage data (both voters and other users) that falls within their geographical `accessScope`.
    *   This must be enforced rigorously using Firestore security rules to prevent any unauthorized data access at the backend level.

*   **Voter Data Management:**
    *   Provide a user-friendly form for adding and editing individual voters.
    *   Implement a robust feature to bulk upload voter data from a CSV file, including validation and error reporting.
    *   Display voter data in a paginated, searchable, and filterable table.

*   **Security - A Top Priority:**
    *   **Secure Data Transmission:** All data transfer between the client and server must be encrypted using modern TLS protocols.
    *   **Data-at-Rest Encryption:** Leverage Firestore's default server-side encryption (AES-256) to protect all stored data.
    *   **Secure Coding Practices:** The generated code should be resilient against common web vulnerabilities, including Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), and any form of injection attack.
    *   **Dependency Security:** Ensure all third-party libraries are up-to-date and free from known vulnerabilities.

**4. Data Models:**

*   **`users` Collection:**
    ```typescript
    export interface User {
      uid: string;
      email: string;
      displayName?: string;
      role: 'super_admin' | 'division_admin' | 'district_admin' | 'upazila_admin' | 'union_admin' | 'village_admin';
      approved: boolean; // Should be true by default as admins create users
      createdAt: string;
      lastLogin?: string;
      accessScope: {
        division_id?: string;
        district_id?: string;
        upazila_id?: string;
        union_id?: string;
        village_id?: string;
        division_name?: string;
        district_name?: string;
        upazila_name?: string;
        union_name?: string;
        village_name?: string;
      };
      assignedBy?: string; // UID of the admin who created this user
    }
    ```
*   **`voters` Collection:**
    ```typescript
    export interface VoterData {
      id?: string; // Firestore Document ID
      // ... include all relevant voter fields as per the existing app
      'Voter Name': string;
      FatherOrHusband?: string;
      Age?: number;
      // Location IDs for scoping
      division_id?: string;
      district_id?: string;
      upazila_id?: string;
      union_id?: string;
      village_id?: string;
      // ... other fields
    }
    ```

**5. Location Data:**

*   The application must use the following JSON files to populate location-based dropdowns and for data mapping. This data should be considered the single source of truth for geographical information.
    *   `public/data/divisions.json`
    *   `public/data/districts.json`
    *   `public/data/upazilas.json`
    *   `public/data/unions.json`
    *   `public/data/village.json`

**6. Example Component for Reference:**

*   To guide the coding style and structure, please refer to the following example component, which demonstrates the desired use of `shadcn/ui`, TypeScript, and general code organization for a documentation page.

    ```typescript
    // src/pages/docs/DataHub.tsx
    import React from 'react';
    import DocumentationLayout from '@/components/layout/DocumentationLayout';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Database, Upload, Download, FileText, Shield } from 'lucide-react';
    import { usePageTitle } from '@/lib/usePageTitle';

    const DataHub = () => {
      usePageTitle('ডেটা হাব ডকুমেন্টেশন');

      return (
        <DocumentationLayout>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <span>ডেটা হাব ডকুমেন্টেশন</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* ... content from the existing DataHub.tsx file ... */}
              </CardContent>
            </Card>
          </div>
        </DocumentationLayout>
      );
    };

    export default DataHub;
    ```
"
