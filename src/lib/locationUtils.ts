import { Division, District, Upazila, Union, Ward, Village } from './types';

// Sample data structure - you can replace these with your actual JSON data
const sampleDivisions: Division[] = [
  { id: "1", name: "Chattagram", bn_name: "চট্টগ্রাম", url: "www.chittagongdiv.gov.bd" },
  { id: "2", name: "Rajshahi", bn_name: "রাজশাহী", url: "www.rajshahidiv.gov.bd" },
  { id: "3", name: "Khulna", bn_name: "খুলনা", url: "www.khulnadiv.gov.bd" },
  { id: "4", name: "Barisal", bn_name: "বরিশাল", url: "www.barisaldiv.gov.bd" },
  { id: "5", name: "Sylhet", bn_name: "সিলেট", url: "www.sylhetdiv.gov.bd" },
  { id: "6", name: "Dhaka", bn_name: "ঢাকা", url: "www.dhakadiv.gov.bd" },
  { id: "7", name: "Rangpur", bn_name: "রংপুর", url: "www.rangpurdiv.gov.bd" },
  { id: "8", name: "Mymensingh", bn_name: "ময়মনসিংহ", url: "www.mymensinghdiv.gov.bd" }
];

const sampleDistricts: District[] = [
  { id: "1", division_id: "1", name: "Comilla", bn_name: "কুমিল্লা", lat: "23.4682747", lon: "91.1788135", url: "www.comilla.gov.bd" },
  { id: "2", division_id: "1", name: "Feni", bn_name: "ফেনী", lat: "23.023231", lon: "91.3840844", url: "www.feni.gov.bd" },
  { id: "3", division_id: "1", name: "Brahmanbaria", bn_name: "ব্রাহ্মণবাড়িয়া", lat: "23.9570904", lon: "91.1119286", url: "www.brahmanbaria.gov.bd" }
];

const sampleUpazilas: Upazila[] = [
  { id: "1", district_id: "1", name: "Debidwar", bn_name: "দেবিদ্বার", url: "debidwar.comilla.gov.bd" },
  { id: "2", district_id: "1", name: "Barura", bn_name: "বরুড়া", url: "barura.comilla.gov.bd" },
  { id: "3", district_id: "1", name: "Brahmanpara", bn_name: "ব্রাহ্মণপাড়া", url: "brahmanpara.comilla.gov.bd" }
];

const sampleUnions: Union[] = [
  { id: "1", upazilla_id: "1", name: "Subil", bn_name: "সুবিল", url: "subilup.comilla.gov.bd" },
  { id: "2", upazilla_id: "1", name: "North Gunaighor", bn_name: "উত্তর গুনাইঘর", url: "gunaighornorthup.comilla.gov.bd" },
  { id: "3", upazilla_id: "1", name: "South Gunaighor", bn_name: "দক্ষিণ গুনাইঘর", url: "gunaighorsouth.comilla.gov.bd" }
];

// Cached data to avoid re-reading
let cachedLocationData: {
  divisions: Division[];
  districts: District[];
  upazilas: Upazila[];
  unions: Union[];
  wards: Ward[];
  villages: Village[];
} | null = null;

// Load location data (in production, this would load from JSON files)
export const loadLocationData = async () => {
  if (cachedLocationData) {
    return cachedLocationData;
  }

  // In production, you would load from JSON files like:
  // const divisionsResponse = await fetch('/data/divisions.json');
  // const divisions = await divisionsResponse.json();
  
  cachedLocationData = {
    divisions: sampleDivisions,
    districts: sampleDistricts,
    upazilas: sampleUpazilas,
    unions: sampleUnions,
    wards: [], // Add your ward data here
    villages: [] // Add your village data here
  };

  return cachedLocationData;
};

// Get all divisions
export const getDivisions = async (): Promise<Division[]> => {
  const data = await loadLocationData();
  return data.divisions;
};

// Get districts by division ID
export const getDistrictsByDivision = async (divisionId: string): Promise<District[]> => {
  const data = await loadLocationData();
  return data.districts.filter(district => district.division_id === divisionId);
};

// Get upazilas by district ID
export const getUpazilasByDistrict = async (districtId: string): Promise<Upazila[]> => {
  const data = await loadLocationData();
  return data.upazilas.filter(upazila => upazila.district_id === districtId);
};

// Get unions by upazila ID
export const getUnionsByUpazila = async (upazilaId: string): Promise<Union[]> => {
  const data = await loadLocationData();
  return data.unions.filter(union => union.upazilla_id === upazilaId);
};

// Get villages by union ID
export const getVillagesByUnion = async (unionId: string): Promise<Village[]> => {
  const data = await loadLocationData();
  return data.villages.filter(village => village.union_id === unionId);
};

// Get location name by ID
export const getLocationName = async (type: 'division' | 'district' | 'upazila' | 'union' | 'ward' | 'village', id: string): Promise<string> => {
  const data = await loadLocationData();
  
  switch (type) {
    case 'division':
      return data.divisions.find(item => item.id === id)?.name || '';
    case 'district':
      return data.districts.find(item => item.id === id)?.name || '';
    case 'upazila':
      return data.upazilas.find(item => item.id === id)?.name || '';
    case 'union':
      return data.unions.find(item => item.id === id)?.name || '';
    case 'ward':
      return data.wards.find(item => item.id === id)?.name || '';
    case 'village':
      return data.villages.find(item => item.id === id)?.name || '';
    default:
      return '';
  }
};

// Get full location hierarchy for a given location
export const getFullLocationHierarchy = async (locationIds: {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  ward_id?: string;
  village_id?: string;
}) => {
  const hierarchy = {
    division: '',
    district: '',
    upazila: '',
    union: '',
    ward: '',
    village: ''
  };

  if (locationIds.division_id) {
    hierarchy.division = await getLocationName('division', locationIds.division_id);
  }
  if (locationIds.district_id) {
    hierarchy.district = await getLocationName('district', locationIds.district_id);
  }
  if (locationIds.upazila_id) {
    hierarchy.upazila = await getLocationName('upazila', locationIds.upazila_id);
  }
  if (locationIds.union_id) {
    hierarchy.union = await getLocationName('union', locationIds.union_id);
  }
  if (locationIds.ward_id) {
    hierarchy.ward = await getLocationName('ward', locationIds.ward_id);
  }
  if (locationIds.village_id) {
    hierarchy.village = await getLocationName('village', locationIds.village_id);
  }

  return hierarchy;
};
