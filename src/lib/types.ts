
export interface VoterData {
  ID: string;
  'House Name'?: string;
  'Voter Name': string;
  'Father/Husband'?: string;
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
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'moderator' | 'user';
  approved: boolean;
  createdAt: string;
  lastLogin?: string;
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
