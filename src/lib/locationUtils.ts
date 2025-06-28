
import { Division, District, Upazila, Union } from './types';

// Cache for loaded data
let cachedLocationData: {
  divisions: Division[];
  districts: District[];
  upazilas: Upazila[];
  unions: Union[];
} | null = null;

// Load location data from static JSON files
export const loadLocationData = async () => {
  if (cachedLocationData) {
    return cachedLocationData;
  }

  try {
    const [divisionsResponse, districtsResponse, upazilasResponse, unionsResponse] = await Promise.all([
      fetch('/data/divisions.json'),
      fetch('/data/districts.json'),
      fetch('/data/upazilas.json'),
      fetch('/data/unions.json')
    ]);

    const [divisions, districts, upazilas, unions] = await Promise.all([
      divisionsResponse.json(),
      districtsResponse.json(),
      upazilasResponse.json(),
      unionsResponse.json()
    ]);

    cachedLocationData = {
      divisions,
      districts,
      upazilas,
      unions
    };

    return cachedLocationData;
  } catch (error) {
    console.error('Error loading location data:', error);
    return {
      divisions: [],
      districts: [],
      upazilas: [],
      unions: []
    };
  }
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

// Get name by ID for any location type
export const getLocationNameById = async (type: 'division' | 'district' | 'upazila' | 'union', id: string): Promise<string> => {
  const data = await loadLocationData();
  
  switch (type) {
    case 'division':
      return data.divisions.find(item => item.id === id)?.bn_name || '';
    case 'district':
      return data.districts.find(item => item.id === id)?.bn_name || '';
    case 'upazila':
      return data.upazilas.find(item => item.id === id)?.bn_name || '';
    case 'union':
      return data.unions.find(item => item.id === id)?.bn_name || '';
    default:
      return '';
  }
};

// Get English name by ID
export const getLocationNameByIdEn = async (type: 'division' | 'district' | 'upazila' | 'union', id: string): Promise<string> => {
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
    default:
      return '';
  }
};

// Get full location hierarchy for display
export const getFullLocationHierarchy = async (locationIds: {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
}) => {
  const hierarchy = {
    division: '',
    district: '',
    upazila: '',
    union: '',
    division_en: '',
    district_en: '',
    upazila_en: '',
    union_en: ''
  };

  if (locationIds.division_id) {
    hierarchy.division = await getLocationNameById('division', locationIds.division_id);
    hierarchy.division_en = await getLocationNameByIdEn('division', locationIds.division_id);
  }
  if (locationIds.district_id) {
    hierarchy.district = await getLocationNameById('district', locationIds.district_id);
    hierarchy.district_en = await getLocationNameByIdEn('district', locationIds.district_id);
  }
  if (locationIds.upazila_id) {
    hierarchy.upazila = await getLocationNameById('upazila', locationIds.upazila_id);
    hierarchy.upazila_en = await getLocationNameByIdEn('upazila', locationIds.upazila_id);
  }
  if (locationIds.union_id) {
    hierarchy.union = await getLocationNameById('union', locationIds.union_id);
    hierarchy.union_en = await getLocationNameByIdEn('union', locationIds.union_id);
  }

  return hierarchy;
};

// Filtering utility functions
export const filterDistrictsByDivision = (districts: District[], divisionId: string): District[] => {
  return districts.filter(district => district.division_id === divisionId);
};

export const filterUpazilasByDistrict = (upazilas: Upazila[], districtId: string): Upazila[] => {
  return upazilas.filter(upazila => upazila.district_id === districtId);
};

export const filterUnionsByUpazila = (unions: Union[], upazilaId: string): Union[] => {
  return unions.filter(union => union.upazilla_id === upazilaId);
};
