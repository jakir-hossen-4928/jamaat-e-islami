
import { useState, useEffect, useMemo } from 'react';

interface LocationItem {
  id: string;
  name: string;
  bn_name: string;
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
}

interface LocationData {
  divisions: LocationItem[];
  districts: LocationItem[];
  upazilas: LocationItem[];
  unions: LocationItem[];
  villages: LocationItem[];
}

export const useLocationData = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    divisions: [],
    districts: [],
    upazilas: [],
    unions: [],
    villages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const [divisionsRes, districtsRes, upazilasRes, unionsRes, villagesRes] = await Promise.all([
          fetch('/data/divisions.json').then(res => res.json()),
          fetch('/data/districts.json').then(res => res.json()),
          fetch('/data/upazilas.json').then(res => res.json()),
          fetch('/data/unions.json').then(res => res.json()),
          fetch('/data/village.json').then(res => res.json())
        ]);

        setLocationData({
          divisions: divisionsRes || [],
          districts: districtsRes || [],
          upazilas: upazilasRes || [],
          unions: unionsRes ? unionsRes.map((union: any) => ({
            ...union,
            upazila_id: union.upazilla_id || union.upazila_id
          })) : [],
          villages: villagesRes ? villagesRes.map((village: any) => ({
            ...village,
            id: village.id?.toString(),
            bn_name: village.village || village.bn_name,
            union_id: village.union_id?.toString()
          })) : []
        });
      } catch (error) {
        console.error('Error loading location data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLocationData();
  }, []);

  const getFilteredDistricts = (divisionId: string) => {
    return locationData.districts.filter(district => district.division_id === divisionId);
  };

  const getFilteredUpazilas = (districtId: string) => {
    return locationData.upazilas.filter(upazila => upazila.district_id === districtId);
  };

  const getFilteredUnions = (upazilaId: string) => {
    return locationData.unions.filter(union => 
      union.upazila_id === upazilaId || (union as any).upazilla_id === upazilaId
    );
  };

  const getFilteredVillages = (unionId: string) => {
    return locationData.villages.filter(village => 
      village.union_id === unionId || (village as any).union_id === parseInt(unionId)
    );
  };

  const getLocationNames = (locationIds: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    village_id?: string;
  }) => {
    const division = locationData.divisions.find(d => d.id === locationIds.division_id);
    const district = locationData.districts.find(d => d.id === locationIds.district_id);
    const upazila = locationData.upazilas.find(u => u.id === locationIds.upazila_id);
    const union = locationData.unions.find(u => u.id === locationIds.union_id);
    const village = locationData.villages.find(v => v.id === locationIds.village_id);

    return {
      division_name: division?.bn_name || '',
      district_name: district?.bn_name || '',
      upazila_name: upazila?.bn_name || '',
      union_name: union?.bn_name || '',
      village_name: village?.bn_name || ''
    };
  };

  return {
    locationData,
    loading,
    getFilteredDistricts,
    getFilteredUpazilas,
    getFilteredUnions,
    getFilteredVillages,
    getLocationNames
  };
};
