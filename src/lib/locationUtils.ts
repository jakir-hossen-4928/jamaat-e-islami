
import { Division, District, Upazila, Union } from './types';

// Enhanced cache with better memory management
let cachedLocationData: {
  divisions: Division[];
  districts: District[];
  upazilas: Upazila[];
  unions: Union[];
  villages: any[];
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
    const [divisionsResponse, districtsResponse, upazilasResponse, unionsResponse, villagesResponse] = await Promise.all([
      fetch('/data/divisions.json'),
      fetch('/data/districts.json'),
      fetch('/data/upazilas.json'),
      fetch('/data/unions.json'),
      fetch('/data/village.json')
    ]);

    const [divisions, districts, upazilas, unions, villages] = await Promise.all([
      divisionsResponse.json(),
      districtsResponse.json(),
      upazilasResponse.json(),
      unionsResponse.json(),
      villagesResponse.json()
    ]);

    cachedLocationData = {
      divisions,
      districts,
      upazilas,
      unions,
      villages,
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
      villages: [],
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
  villages: Map<string, any>;
} | null = null;

const createLocationMaps = async () => {
  if (locationMaps) return locationMaps;
  
  const data = await loadLocationData();
  
  locationMaps = {
    divisions: new Map(data.divisions.map(d => [d.id, d])),
    districts: new Map(data.districts.map(d => [d.id, d])),
    upazilas: new Map(data.upazilas.map(u => [u.id, u])),
    unions: new Map(data.unions.map(u => [u.id, u])),
    villages: new Map(data.villages.map((v, index) => [`village_${v.union_id}_${index}`, v]))
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

// Get villages by union ID - now properly implemented
export const getVillagesByUnion = async (unionId: string): Promise<any[]> => {
  const data = await loadLocationData();
  return data.villages.filter(village => village.union_id.toString() === unionId.toString()).map((village, index) => ({
    id: `village_${village.union_id}_${index}`,
    name: village.village,
    bn_name: village.village,
    union_id: village.union_id,
    union_name: village.union_name
  }));
};

// Optimized location name lookup using Maps
export const getLocationNameById = async (type: 'division' | 'district' | 'upazila' | 'union' | 'village', id: string): Promise<string> => {
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
    case 'village':
      return maps.villages.get(id)?.village || '';
    default:
      return '';
  }
};

// Optimized English name lookup
export const getLocationNameByIdEn = async (type: 'division' | 'district' | 'upazila' | 'union' | 'village', id: string): Promise<string> => {
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
    case 'village':
      return maps.villages.get(id)?.village || '';
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
  village_id?: string;
}) => {
  const maps = await createLocationMaps();
  
  const hierarchy = {
    division: '',
    district: '',
    upazila: '',
    union: '',
    village: '',
    division_en: '',
    district_en: '',
    upazila_en: '',
    union_en: '',
    village_en: ''
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

  if (locationIds.village_id) {
    const village = maps.villages.get(locationIds.village_id);
    if (village) {
      hierarchy.village = village.village;
      hierarchy.village_en = village.village;
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

export const filterVillagesByUnion = (villages: any[], unionId: string): any[] => {
  return villages.filter(village => village.union_id.toString() === unionId.toString());
};
