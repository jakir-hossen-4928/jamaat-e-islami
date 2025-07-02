
export interface VoterData {
  id?: string; // Firestore Document ID
  ID: string;

  // Personal Info
  Name: string; // Changed from 'Voter Name' to 'Name'
  'Fathers Name': string; // Keep this as is
  'Mothers Name': string; // Keep this as is
  FatherOrHusband?: string;
  Age?: number;
  Gender?: 'Male' | 'Female' | 'Other' | 'পুরুষ' | 'মহিলা';
  'Marital Status'?: 'Married' | 'Unmarried' | 'Widowed' | 'Divorced';
  Student?: 'Yes' | 'No';
  Occupation?: string;
  Education?: string;
  Religion?: string;

  // Contact Info
  Phone?: string;
  Mobile?: string; // Added Mobile field
  NID?: string;
  'Voter ID'?: string; // Added Voter ID field

  // Voting Info
  'Will Vote'?: 'Yes' | 'No';
  'Voted Before'?: 'Yes' | 'No';
  'Vote Probability (%)'?: number;
  'Priority Level'?: string; // Added Priority Level
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
  Division?: string;
  District?: string;
  Upazila?: string;
  Union?: string;
  Village?: string;
  'Village Name'?: string;

  // Additional fields
  Serial?: string;
  'Blood Group'?: string;
  Picture?: string;
  Address?: string;

  // Metadata
  'House Name'?: string;
  Remarks?: string;
  'Special Note'?: string;
  Collector?: string;
  'Collection Date'?: string;
  'Last Updated'?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'super_admin' | 'village_admin'; // Only two roles now
  approved: boolean;
  createdAt: string;
  lastLogin?: string;
  // Location-based access scope - defines what areas user can access
  accessScope: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    village_id?: string;
    // Location names for display
    division_name?: string;
    district_name?: string;
    upazila_name?: string;
    union_name?: string;
    village_name?: string;
  };
  // Assigned by role hierarchy
  assignedBy?: string; // UID of the admin who assigned this role
  verifiedBy?: string; // UID of the admin who verified this user
}

export interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  targetAudience: string[];
  sentCount: number;
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  createdBy: string; // UID of creator
  // Location-based targeting
  locationScope: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    village_id?: string;
  };
}

// Location hierarchy interfaces
export interface Division {
  id: string;
  name: string;
  bn_name: string;
  url: string;
}

export interface District {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
  lat: string;
  lon: string;
  url: string;
}

export interface Upazila {
  id: string;
  district_id: string;
  name: string;
  bn_name: string;
  url: string;
}

export interface Union {
  id: string;
  upazilla_id: string;
  name: string;
  bn_name: string;
  url: string;
}

export interface Ward {
  id: string;
  union_id: string;
  name: string;
  bn_name: string;
  ward_no: string;
  type: 'city_corporation' | 'municipality' | 'union_council';
}

export interface Village {
  id: string;
  union_id: string;
  name: string;
  bn_name: string;
  upazila_id: string;
  district_id: string;
  division_id: string;
}

// Location data structure for JSON files
export interface LocationData {
  divisions: Division[];
  districts: District[];
  upazilas: Upazila[];
  unions: Union[];
  wards: Ward[];
  villages: Village[];
}

// Role-based permissions interface
export interface RolePermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canAssignRoles: string[]; // Array of roles this user can assign
  canVerifyUsers: boolean;
  canAccessDataHub: boolean;
  canAccessAllVoters: boolean;
  locationScope: 'all' | 'village';
}

export type UserRole = 'super_admin' | 'village_admin'; // Only two roles now
