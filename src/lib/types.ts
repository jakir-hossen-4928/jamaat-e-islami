
export interface VoterData {
  id?: string; // Add id property for Firestore document ID
  ID: string;
  'House Name'?: string;
  'Voter Name': string;
  FatherOrHusband?: string; 
  Age?: number;
  Gender?: 'Male' | 'Female' | 'Other';
  'Marital Status'?: 'Married' | 'Unmarried' | 'Widowed' | 'Divorced';
  Student?: 'Yes' | 'No';
  Occupation?: string;
  Education?: string;
  Religion?: string;
  Phone?: string;
  WhatsApp?: 'Yes' | 'No';
  NID?: string;
  'Is Voter'?: 'Yes' | 'No';
  'Will Vote'?: 'Yes' | 'No';
  'Voted Before'?: 'Yes' | 'No';
  'Vote Probability (%)'?: number;
  'Political Support'?: string;
  'Priority Level'?: 'Low' | 'Medium' | 'High';
  'Has Disability'?: 'Yes' | 'No';
  'Is Migrated'?: 'Yes' | 'No';
  Remarks?: string;
  Collector?: string;
  'Collection Date'?: string;
  'Last Updated'?: string;
  // Location hierarchy IDs
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  ward_id?: string;
  village_id?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'super_admin' | 'division_admin' | 'district_admin' | 'ward_admin' | 'moderator' | 'user' | 'admin';
  approved: boolean;
  createdAt: string;
  lastLogin?: string;
  // Role-based access scope
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  ward_id?: string;
}

export interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  targetAudience: string[];
  sentCount: number;
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
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
  ward_id: string;
  name: string;
  bn_name: string;
  locality_type: 'village' | 'neighborhood' | 'locality';
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
