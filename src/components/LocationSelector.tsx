import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import {
  getDivisions,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getUnionsByUpazila,
  getVillagesByUnion
} from '@/lib/locationUtils';
import { Division, District, Upazila, Union, Village } from '@/lib/types';

interface LocationSelectorProps {
  onLocationChange: (locationIds: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    village_id?: string;
  }) => void;
  initialValues?: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    village_id?: string;
  };
  title?: string;
  showAllLevels?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationChange,
  initialValues,
  title = "অবস্থান নির্বাচন করুন",
  showAllLevels = true
}) => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('');
  const [selectedUnion, setSelectedUnion] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

  const [loading, setLoading] = useState<{
    divisions: boolean;
    districts: boolean;
    upazilas: boolean;
    unions: boolean;
    villages: boolean;
  }>({
    divisions: false,
    districts: false,
    upazilas: false,
    unions: false,
    villages: false
  });

  // Load divisions on component mount
  useEffect(() => {
    const loadDivisions = async () => {
      setLoading(prev => ({ ...prev, divisions: true }));
      try {
        const divisionsData = await getDivisions();
        setDivisions(divisionsData);
      } catch (error) {
        console.error('Error loading divisions:', error);
      } finally {
        setLoading(prev => ({ ...prev, divisions: false }));
      }
    };
    loadDivisions();
  }, []);

  // Set initial values
  useEffect(() => {
    if (initialValues) {
      setSelectedDivision(initialValues.division_id || '');
      setSelectedDistrict(initialValues.district_id || '');
      setSelectedUpazila(initialValues.upazila_id || '');
      setSelectedUnion(initialValues.union_id || '');
      setSelectedVillage(initialValues.village_id || '');
    }
  }, [initialValues]);

  // Handle division change
  const handleDivisionChange = async (divisionId: string) => {
    setSelectedDivision(divisionId);
    setSelectedDistrict('');
    setSelectedUpazila('');
    setSelectedUnion('');
    setSelectedVillage('');
    
    setDistricts([]);
    setUpazilas([]);
    setUnions([]);
    setVillages([]);

    if (divisionId) {
      setLoading(prev => ({ ...prev, districts: true }));
      try {
        const districtsData = await getDistrictsByDivision(divisionId);
        setDistricts(districtsData);
      } catch (error) {
        console.error('Error loading districts:', error);
      } finally {
        setLoading(prev => ({ ...prev, districts: false }));
      }
    }

    onLocationChange({
      division_id: divisionId || undefined
    });
  };

  // Handle district change
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedUpazila('');
    setSelectedUnion('');
    setSelectedVillage('');
    
    setUpazilas([]);
    setUnions([]);
    setVillages([]);

    if (districtId) {
      setLoading(prev => ({ ...prev, upazilas: true }));
      try {
        const upazilasData = await getUpazilasByDistrict(districtId);
        setUpazilas(upazilasData);
      } catch (error) {
        console.error('Error loading upazilas:', error);
      } finally {
        setLoading(prev => ({ ...prev, upazilas: false }));
      }
    }

    onLocationChange({
      division_id: selectedDivision || undefined,
      district_id: districtId || undefined
    });
  };

  // Handle upazila change
  const handleUpazilaChange = async (upazilaId: string) => {
    setSelectedUpazila(upazilaId);
    setSelectedUnion('');
    setSelectedVillage('');
    
    setUnions([]);
    setVillages([]);

    if (upazilaId) {
      setLoading(prev => ({ ...prev, unions: true }));
      try {
        const unionsData = await getUnionsByUpazila(upazilaId);
        setUnions(unionsData);
      } catch (error) {
        console.error('Error loading unions:', error);
      } finally {
        setLoading(prev => ({ ...prev, unions: false }));
      }
    }

    onLocationChange({
      division_id: selectedDivision || undefined,
      district_id: selectedDistrict || undefined,
      upazila_id: upazilaId || undefined
    });
  };

  // Handle union change
  const handleUnionChange = async (unionId: string) => {
    setSelectedUnion(unionId);
    setSelectedVillage('');
    setVillages([]);

    if (unionId && showAllLevels) {
      setLoading(prev => ({ ...prev, villages: true }));
      try {
        const villagesData = await getVillagesByUnion(unionId);
        setVillages(villagesData);
      } catch (error) {
        console.error('Error loading villages:', error);
      } finally {
        setLoading(prev => ({ ...prev, villages: false }));
      }
    }

    onLocationChange({
      division_id: selectedDivision || undefined,
      district_id: selectedDistrict || undefined,
      upazila_id: selectedUpazila || undefined,
      union_id: unionId || undefined
    });
  };

  // Handle village change
  const handleVillageChange = (villageId: string) => {
    setSelectedVillage(villageId);

    onLocationChange({
      division_id: selectedDivision || undefined,
      district_id: selectedDistrict || undefined,
      upazila_id: selectedUpazila || undefined,
      union_id: selectedUnion || undefined,
      village_id: villageId || undefined
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Division Selector */}
        <div className="space-y-2">
          <Label htmlFor="division">বিভাগ</Label>
          <Select value={selectedDivision} onValueChange={handleDivisionChange}>
            <SelectTrigger className="w-full">
              {loading.divisions ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>লোড হচ্ছে...</span>
                </div>
              ) : (
                <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
              )}
            </SelectTrigger>
            <SelectContent className="bg-white">
              {divisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.bn_name} ({division.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District Selector */}
        {selectedDivision && (
          <div className="space-y-2">
            <Label htmlFor="district">জেলা</Label>
            <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
              <SelectTrigger className="w-full">
                {loading.districts ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>লোড হচ্ছে...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="জেলা নির্বাচন করুন" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-white">
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.bn_name} ({district.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Upazila Selector */}
        {selectedDistrict && (
          <div className="space-y-2">
            <Label htmlFor="upazila">উপজেলা</Label>
            <Select value={selectedUpazila} onValueChange={handleUpazilaChange}>
              <SelectTrigger className="w-full">
                {loading.upazilas ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>লোড হচ্ছে...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-white">
                {upazilas.map((upazila) => (
                  <SelectItem key={upazila.id} value={upazila.id}>
                    {upazila.bn_name} ({upazila.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Union Selector */}
        {selectedUpazila && (
          <div className="space-y-2">
            <Label htmlFor="union">ইউনিয়ন</Label>
            <Select value={selectedUnion} onValueChange={handleUnionChange}>
              <SelectTrigger className="w-full">
                {loading.unions ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>লোড হচ্ছে...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-white">
                {unions.map((union) => (
                  <SelectItem key={union.id} value={union.id}>
                    {union.bn_name} ({union.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Village Selector */}
        {selectedUnion && showAllLevels && villages.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="village">গ্রাম/এলাকা</Label>
            <Select value={selectedVillage} onValueChange={handleVillageChange}>
              <SelectTrigger className="w-full">
                {loading.villages ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>লোড হচ্ছে...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="গ্রাম/এলাকা নির্বাচন করুন" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-white">
                {villages.map((village) => (
                  <SelectItem key={village.id} value={village.id}>
                    {village.bn_name} ({village.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationSelector;
