import { User } from './types';

export interface OptimizedLocationData {
  divisions: DivisionData[];
  districts: DistrictData[];
  upazilas: UpazilaData[];
  unions: UnionData[];
  villages: VillageData[];
  // Indexed data for faster lookups
  districtsByDivision: Record<string, DistrictData[]>;
  upazilasByDistrict: Record<string, UpazilaData[]>;
  unionsByUpazila: Record<string, UnionData[]>;
  villagesByUnion: Record<string, VillageData[]>;
  // Name lookups
  divisionNames: Record<string, string>;
  districtNames: Record<string, string>;
  upazilaNames: Record<string, string>;
  unionNames: Record<string, string>;
  villageNames: Record<string, string>;
}

export interface DivisionData {
  id: string;
  name: string;
  bn_name: string;
}

export interface DistrictData {
  id: string;
  name: string;
  bn_name: string;
  division_id: string;
}

export interface UpazilaData {
  id: string;
  name: string;
  bn_name: string;
  district_id: string;
}

export interface UnionData {
  id: string;
  name: string;
  bn_name: string;
  upazilla_id: string;
}

export interface VillageData {
  id: number;
  union_id: number;
  village: string;
}

// Global cache for optimized location data
let optimizedLocationCache: OptimizedLocationData | null = null;

/**
 * Load and optimize location data for better performance
 */
export const loadOptimizedLocationData = async (): Promise<OptimizedLocationData> => {
  // Return cached data if available
  if (optimizedLocationCache) {
    return optimizedLocationCache;
  }

  try {
    // Load all location data in parallel
    const [divisionsRes, districtsRes, upazilasRes, unionsRes, villagesRes] = await Promise.all([
      fetch('/data/divisions.json'),
      fetch('/data/districts.json'),
      fetch('/data/upazilas.json'),
      fetch('/data/unions.json'),
      fetch('/data/villages.json')
    ]);

    const [divisions, districts, upazilas, unions, villages] = await Promise.all([
      divisionsRes.json(),
      districtsRes.json(),
      upazilasRes.json(),
      unionsRes.json(),
      villagesRes.json()
    ]);

    // Create indexed data structures for faster lookups
    const districtsByDivision: Record<string, DistrictData[]> = {};
    const upazilasByDistrict: Record<string, UpazilaData[]> = {};
    const unionsByUpazila: Record<string, UnionData[]> = {};
    const villagesByUnion: Record<string, VillageData[]> = {};

    // Index districts by division
    districts.forEach((district: DistrictData) => {
      if (!districtsByDivision[district.division_id]) {
        districtsByDivision[district.division_id] = [];
      }
      districtsByDivision[district.division_id].push(district);
    });

    // Index upazilas by district
    upazilas.forEach((upazila: UpazilaData) => {
      if (!upazilasByDistrict[upazila.district_id]) {
        upazilasByDistrict[upazila.district_id] = [];
      }
      upazilasByDistrict[upazila.district_id].push(upazila);
    });

    // Index unions by upazila
    unions.forEach((union: UnionData) => {
      if (!unionsByUpazila[union.upazilla_id]) {
        unionsByUpazila[union.upazilla_id] = [];
      }
      unionsByUpazila[union.upazilla_id].push(union);
    });

    // Index villages by union
    villages.forEach((village: VillageData) => {
      const unionId = village.union_id.toString();
      if (!villagesByUnion[unionId]) {
        villagesByUnion[unionId] = [];
      }
      villagesByUnion[unionId].push(village);
    });

    // Create name lookup maps
    const divisionNames: Record<string, string> = {};
    const districtNames: Record<string, string> = {};
    const upazilaNames: Record<string, string> = {};
    const unionNames: Record<string, string> = {};
    const villageNames: Record<string, string> = {};

    divisions.forEach((division: DivisionData) => {
      divisionNames[division.id] = division.name;
    });

    districts.forEach((district: DistrictData) => {
      districtNames[district.id] = district.name;
    });

    upazilas.forEach((upazila: UpazilaData) => {
      upazilaNames[upazila.id] = upazila.name;
    });

    unions.forEach((union: UnionData) => {
      unionNames[union.id] = union.name;
    });

    villages.forEach((village: VillageData) => {
      villageNames[village.id.toString()] = village.village;
    });

    // Create optimized data structure
    const optimizedData: OptimizedLocationData = {
      divisions,
      districts,
      upazilas,
      unions,
      villages,
      districtsByDivision,
      upazilasByDistrict,
      unionsByUpazila,
      villagesByUnion,
      divisionNames,
      districtNames,
      upazilaNames,
      unionNames,
      villageNames,
    };

    // Cache the optimized data
    optimizedLocationCache = optimizedData;

    console.log('Optimized location data loaded:', {
      divisions: divisions.length,
      districts: districts.length,
      upazilas: upazilas.length,
      unions: unions.length,
      villages: villages.length,
    });

    return optimizedData;
  } catch (error) {
    console.error('Error loading optimized location data:', error);
    throw error;
  }
};

/**
 * Get filtered districts for a division (optimized)
 */
export const getFilteredDistrictsOptimized = (
  divisionId: string,
  optimizedData: OptimizedLocationData
): DistrictData[] => {
  return optimizedData.districtsByDivision[divisionId] || [];
};

/**
 * Get filtered upazilas for a district (optimized)
 */
export const getFilteredUpazilasOptimized = (
  districtId: string,
  optimizedData: OptimizedLocationData
): UpazilaData[] => {
  return optimizedData.upazilasByDistrict[districtId] || [];
};

/**
 * Get filtered unions for an upazila (optimized)
 */
export const getFilteredUnionsOptimized = (
  upazilaId: string,
  optimizedData: OptimizedLocationData
): UnionData[] => {
  return optimizedData.unionsByUpazila[upazilaId] || [];
};

/**
 * Get filtered villages for a union (optimized)
 */
export const getFilteredVillagesOptimized = (
  unionId: string,
  optimizedData: OptimizedLocationData
): VillageData[] => {
  return optimizedData.villagesByUnion[unionId] || [];
};

/**
 * Get location names efficiently using lookup maps
 */
export const getLocationNamesOptimized = (
  locationIds: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    village_id?: string;
  },
  optimizedData: OptimizedLocationData
) => {
  return {
    division_name: locationIds.division_id ? optimizedData.divisionNames[locationIds.division_id] : undefined,
    district_name: locationIds.district_id ? optimizedData.districtNames[locationIds.district_id] : undefined,
    upazila_name: locationIds.upazila_id ? optimizedData.upazilaNames[locationIds.upazila_id] : undefined,
    union_name: locationIds.union_id ? optimizedData.unionNames[locationIds.union_id] : undefined,
    village_name: locationIds.village_id ? optimizedData.villageNames[locationIds.village_id] : undefined,
  };
};

/**
 * Get role-based filtered data for a user
 */
export const getRoleBasedFilteredData = (
  user: User,
  optimizedData: OptimizedLocationData
) => {
  if (user.role === 'super_admin') {
    return {
      availableDivisions: optimizedData.divisions,
      availableDistricts: optimizedData.districts,
      availableUpazilas: optimizedData.upazilas,
      availableUnions: optimizedData.unions,
      availableVillages: optimizedData.villages,
    };
  }

  const { accessScope } = user;
  
  switch (user.role) {
    case 'division_admin':
      return {
        availableDivisions: optimizedData.divisions.filter(d => d.id === accessScope.division_id),
        availableDistricts: optimizedData.districtsByDivision[accessScope.division_id || ''] || [],
        availableUpazilas: optimizedData.upazilas.filter(u => {
          const district = optimizedData.districts.find(d => d.id === u.district_id);
          return district?.division_id === accessScope.division_id;
        }),
        availableUnions: optimizedData.unions.filter(u => {
          const upazila = optimizedData.upazilas.find(up => up.id === u.upazilla_id);
          const district = optimizedData.districts.find(d => d.id === upazila?.district_id);
          return district?.division_id === accessScope.division_id;
        }),
        availableVillages: optimizedData.villages.filter(v => {
          const union = optimizedData.unions.find(u => u.id === v.union_id.toString());
          const upazila = optimizedData.upazilas.find(up => up.id === union?.upazilla_id);
          const district = optimizedData.districts.find(d => d.id === upazila?.district_id);
          return district?.division_id === accessScope.division_id;
        }),
      };

    case 'district_admin':
      return {
        availableDivisions: optimizedData.divisions.filter(d => d.id === accessScope.division_id),
        availableDistricts: optimizedData.districts.filter(d => d.id === accessScope.district_id),
        availableUpazilas: optimizedData.upazilasByDistrict[accessScope.district_id || ''] || [],
        availableUnions: optimizedData.unions.filter(u => {
          const upazila = optimizedData.upazilas.find(up => up.id === u.upazilla_id);
          return upazila?.district_id === accessScope.district_id;
        }),
        availableVillages: optimizedData.villages.filter(v => {
          const union = optimizedData.unions.find(u => u.id === v.union_id.toString());
          const upazila = optimizedData.upazilas.find(up => up.id === union?.upazilla_id);
          return upazila?.district_id === accessScope.district_id;
        }),
      };

    case 'upazila_admin':
      return {
        availableDivisions: optimizedData.divisions.filter(d => d.id === accessScope.division_id),
        availableDistricts: optimizedData.districts.filter(d => d.id === accessScope.district_id),
        availableUpazilas: optimizedData.upazilas.filter(u => u.id === accessScope.upazila_id),
        availableUnions: optimizedData.unionsByUpazila[accessScope.upazila_id || ''] || [],
        availableVillages: optimizedData.villages.filter(v => {
          const union = optimizedData.unions.find(u => u.id === v.union_id.toString());
          return union?.upazilla_id === accessScope.upazila_id;
        }),
      };

    case 'union_admin':
      return {
        availableDivisions: optimizedData.divisions.filter(d => d.id === accessScope.division_id),
        availableDistricts: optimizedData.districts.filter(d => d.id === accessScope.district_id),
        availableUpazilas: optimizedData.upazilas.filter(u => u.id === accessScope.upazila_id),
        availableUnions: optimizedData.unions.filter(u => u.id === accessScope.union_id),
        availableVillages: optimizedData.villagesByUnion[accessScope.union_id || ''] || [],
      };

    case 'village_admin':
      return {
        availableDivisions: optimizedData.divisions.filter(d => d.id === accessScope.division_id),
        availableDistricts: optimizedData.districts.filter(d => d.id === accessScope.district_id),
        availableUpazilas: optimizedData.upazilas.filter(u => u.id === accessScope.upazila_id),
        availableUnions: optimizedData.unions.filter(u => u.id === accessScope.union_id),
        availableVillages: optimizedData.villages.filter(v => v.id.toString() === accessScope.village_id),
      };

    default:
      return {
        availableDivisions: [],
        availableDistricts: [],
        availableUpazilas: [],
        availableUnions: [],
        availableVillages: [],
      };
  }
};

/**
 * Clear the location data cache (useful for testing or memory management)
 */
export const clearLocationDataCache = () => {
  optimizedLocationCache = null;
};

/**
 * Preload location data for better user experience
 */
export const preloadLocationData = async (): Promise<void> => {
  try {
    await loadOptimizedLocationData();
    console.log('Location data preloaded successfully');
  } catch (error) {
    console.error('Failed to preload location data:', error);
  }
}; 