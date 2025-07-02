
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

// Export functions needed by components
export const getDivisions = async () => {
  const data = await loadLocationData();
  return data.divisions;
};

export const getDistrictsByDivision = async (divisionId: string) => {
  const data = await loadLocationData();
  return data.districts.filter(d => d.division_id === divisionId);
};

export const getUpazilasByDistrict = async (districtId: string) => {
  const data = await loadLocationData();
  return data.upazilas.filter(u => u.district_id === districtId);
};

export const getUnionsByUpazila = async (upazilaId: string) => {
  const data = await loadLocationData();
  return data.unions.filter(u => u.upazilla_id === upazilaId);
};

export const getVillagesByUnion = async (unionId: string) => {
  const data = await loadLocationData();
  return data.villages.filter(v => v.union_id.toString() === unionId);
};

// Optimized location hierarchy lookup
export const getFullLocationHierarchy = async (locationIds: {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}) => {
  const locationData = await loadLocationData();

  const hierarchy = {
    division: '',
    district: '',
    upazila: '',
    union: '',
    village: ''
  };

  try {
    if (locationIds.division_id) {
      const division = locationData.divisions.find(d => d.id === locationIds.division_id);
      hierarchy.division = division?.name || '';
    }

    if (locationIds.district_id) {
      const district = locationData.districts.find(d => d.id === locationIds.district_id);
      hierarchy.district = district?.name || '';
    }

    if (locationIds.upazila_id) {
      const upazila = locationData.upazilas.find(u => u.id === locationIds.upazila_id);
      hierarchy.upazila = upazila?.name || '';
    }

    if (locationIds.union_id) {
      const union = locationData.unions.find(u => u.id === locationIds.union_id);
      hierarchy.union = union?.name || '';
    }

    if (locationIds.village_id) {
      const village = locationData.villages.find(v => v.id.toString() === locationIds.village_id);
      hierarchy.village = village?.village || '';
    }
  } catch (error) {
    console.error('Error getting location hierarchy:', error);
  }

  return hierarchy;
};

// Get filtered data based on parent selection
export const getFilteredDistricts = async (divisionId?: string) => {
  const locationData = await loadLocationData();
  if (!divisionId) return locationData.districts;
  return locationData.districts.filter(d => d.division_id === divisionId);
};

export const getFilteredUpazilas = async (districtId?: string) => {
  const locationData = await loadLocationData();
  if (!districtId) return locationData.upazilas;
  return locationData.upazilas.filter(u => u.district_id === districtId);
};

export const getFilteredUnions = async (upazilaId?: string) => {
  const locationData = await loadLocationData();
  if (!upazilaId) return locationData.unions;
  return locationData.unions.filter(u => u.upazilla_id === upazilaId);
};

export const getFilteredVillages = async (unionId?: string) => {
  const locationData = await loadLocationData();
  if (!unionId) return locationData.villages;
  return locationData.villages.filter(v => v.union_id.toString() === unionId);
};
