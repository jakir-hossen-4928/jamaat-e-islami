
import { Division, District, Upazila, Union } from './types';

// Enhanced cache with better memory management
let cachedLocationData: {
  divisions: Division[];
  districts: District[];
  upazilas: Upazila[];
  unions: Union[];
  lastLoaded: number;
} | null = null;

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Load location data from static JSON files with better caching
export const loadLocationData = async () => {
  // Check if cache is still valid
  if (cachedLocationData && 
      (Date.now() - cachedLocationData.lastLoaded) < CACHE_DURATION) {
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
      unions,
      lastLoaded: Date.now()
    };

    return cachedLocationData;
  } catch (error) {
    console.error('Error loading location data:', error);
    return {
      divisions: [],
      districts: [],
      upazilas: [],
      unions: [],
      lastLoaded: Date.now()
    };
  }
};

// Optimized lookup functions with in-memory maps
let locationMaps: {
  divisions: Map<string, Division>;
  districts: Map<string, District>;
  upazilas: Map<string, Upazila>;
  unions: Map<string, Union>;
} | null = null;

const createLocationMaps = async () => {
  if (locationMaps) return locationMaps;
  
  const data = await loadLocationData();
  
  locationMaps = {
    divisions: new Map(data.divisions.map(d => [d.id, d])),
    districts: new Map(data.districts.map(d => [d.id, d])),
    upazilas: new Map(data.upazilas.map(u => [u.id, u])),
    unions: new Map(data.unions.map(u => [u.id, u]))
  };
  
  return locationMaps;
};

// Get all divisions
export const getDivisions = async (): Promise<Division[]> => {
  const data = await loadLocationData();
  return data.divisions;
};

// Get districts by division ID with optimized filtering
export const getDistrictsByDivision = async (divisionId: string): Promise<District[]> => {
  const data = await loadLocationData();
  return data.districts.filter(district => district.division_id === divisionId);
};

// Get upazilas by district ID with optimized filtering
export const getUpazilasByDistrict = async (districtId: string): Promise<Upazila[]> => {
  const data = await loadLocationData();
  return data.upazilas.filter(upazila => upazila.district_id === districtId);
};

// Get unions by upazila ID with optimized filtering
export const getUnionsByUpazila = async (upazilaId: string): Promise<Union[]> => {
  const data = await loadLocationData();
  return data.unions.filter(union => union.upazilla_id === upazilaId);
};

// Placeholder for villages - return empty array to reduce unnecessary calls
export const getVillagesByUnion = async (unionId: string): Promise<any[]> => {
  return [];
};

// Optimized location name lookup using Maps
export const getLocationNameById = async (type: 'division' | 'district' | 'upazila' | 'union', id: string): Promise<string> => {
  const maps = await createLocationMaps();
  
  switch (type) {
    case 'division':
      return maps.divisions.get(id)?.bn_name || '';
    case 'district':
      return maps.districts.get(id)?.bn_name || '';
    case 'upazila':
      return maps.upazilas.get(id)?.bn_name || '';
    case 'union':
      return maps.unions.get(id)?.bn_name || '';
    default:
      return '';
  }
};

// Optimized English name lookup
export const getLocationNameByIdEn = async (type: 'division' | 'district' | 'upazila' | 'union', id: string): Promise<string> => {
  const maps = await createLocationMaps();
  
  switch (type) {
    case 'division':
      return maps.divisions.get(id)?.name || '';
    case 'district':
      return maps.districts.get(id)?.name || '';
    case 'upazila':
      return maps.upazilas.get(id)?.name || '';
    case 'union':
      return maps.unions.get(id)?.name || '';
    default:
      return '';
  }
};

// Batch location hierarchy lookup to reduce API calls
export const getFullLocationHierarchy = async (locationIds: {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
}) => {
  const maps = await createLocationMaps();
  
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
    const division = maps.divisions.get(locationIds.division_id);
    if (division) {
      hierarchy.division = division.bn_name;
      hierarchy.division_en = division.name;
    }
  }
  
  if (locationIds.district_id) {
    const district = maps.districts.get(locationIds.district_id);
    if (district) {
      hierarchy.district = district.bn_name;
      hierarchy.district_en = district.name;
    }
  }
  
  if (locationIds.upazila_id) {
    const upazila = maps.upazilas.get(locationIds.upazila_id);
    if (upazila) {
      hierarchy.upazila = upazila.bn_name;
      hierarchy.upazila_en = upazila.name;
    }
  }
  
  if (locationIds.union_id) {
    const union = maps.unions.get(locationIds.union_id);
    if (union) {
      hierarchy.union = union.bn_name;
      hierarchy.union_en = union.name;
    }
  }

  return hierarchy;
};

// Optimized filtering utility functions
export const filterDistrictsByDivision = (districts: District[], divisionId: string): District[] => {
  return districts.filter(district => district.division_id === divisionId);
};

export const filterUpazilasByDistrict = (upazilas: Upazila[], districtId: string): Upazila[] => {
  return upazilas.filter(upazila => upazila.district_id === districtId);
};

export const filterUnionsByUpazila = (unions: Union[], upazilaId: string): Union[] => {
  return unions.filter(union => union.upazilla_id === upazilaId);
};
