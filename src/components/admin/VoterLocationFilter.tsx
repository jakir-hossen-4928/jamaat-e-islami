
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface LocationData {
  divisions: any[];
  districts: any[];
  upazilas: any[];
  unions: any[];
  villages: any[];
}

interface VoterLocationFilterProps {
  locationData: LocationData;
  selectedLocation: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    village_id?: string;
  };
  onLocationChange: (location: any) => void;
  userRole: string;
  disabled?: boolean;
}

const VoterLocationFilter: React.FC<VoterLocationFilterProps> = ({
  locationData,
  selectedLocation,
  onLocationChange,
  userRole,
  disabled = false
}) => {
  const clearFilters = () => {
    onLocationChange({});
  };

  const handleLocationChange = (level: string, value: string) => {
    const updated = { ...selectedLocation };
    
    // Clear dependent filters when parent changes
    if (level === 'division_id') {
      updated.district_id = undefined;
      updated.upazila_id = undefined;
      updated.union_id = undefined;
      updated.village_id = undefined;
    } else if (level === 'district_id') {
      updated.upazila_id = undefined;
      updated.union_id = undefined;
      updated.village_id = undefined;
    } else if (level === 'upazila_id') {
      updated.union_id = undefined;
      updated.village_id = undefined;
    } else if (level === 'union_id') {
      updated.village_id = undefined;
    }
    
    // Set the new value, or remove it if it's "all"
    if (value === 'all') {
      updated[level as keyof typeof updated] = undefined;
    } else {
      updated[level as keyof typeof updated] = value;
    }
    
    onLocationChange(updated);
  };

  // Filter data based on selections
  const getFilteredDistricts = () => {
    if (!selectedLocation.division_id) return locationData.districts;
    return locationData.districts.filter(d => d.division_id === selectedLocation.division_id);
  };

  const getFilteredUpazilas = () => {
    if (!selectedLocation.district_id) return locationData.upazilas;
    return locationData.upazilas.filter(u => u.district_id === selectedLocation.district_id);
  };

  const getFilteredUnions = () => {
    if (!selectedLocation.upazila_id) return locationData.unions;
    return locationData.unions.filter(u => u.upazilla_id === selectedLocation.upazila_id);
  };

  const getFilteredVillages = () => {
    if (!selectedLocation.union_id) return locationData.villages;
    return locationData.villages.filter(v => v.union_id === selectedLocation.union_id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>এলাকা ভিত্তিক ফিল্টার</CardTitle>
          {userRole === 'super_admin' && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              ফিল্টার মুছুন
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label>বিভাগ</Label>
            <Select 
              value={selectedLocation.division_id || 'all'} 
              onValueChange={(value) => handleLocationChange('division_id', value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব বিভাগ</SelectItem>
                {locationData.divisions.map(division => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name} ({division.bn_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>জেলা</Label>
            <Select 
              value={selectedLocation.district_id || 'all'} 
              onValueChange={(value) => handleLocationChange('district_id', value)}
              disabled={disabled || !selectedLocation.division_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="জেলা নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব জেলা</SelectItem>
                {getFilteredDistricts().map(district => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name} ({district.bn_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>উপজেলা</Label>
            <Select 
              value={selectedLocation.upazila_id || 'all'} 
              onValueChange={(value) => handleLocationChange('upazila_id', value)}
              disabled={disabled || !selectedLocation.district_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব উপজেলা</SelectItem>
                {getFilteredUpazilas().map(upazila => (
                  <SelectItem key={upazila.id} value={upazila.id}>
                    {upazila.name} ({upazila.bn_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>ইউনিয়ন</Label>
            <Select 
              value={selectedLocation.union_id || 'all'} 
              onValueChange={(value) => handleLocationChange('union_id', value)}
              disabled={disabled || !selectedLocation.upazila_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ইউনিয়ন</SelectItem>
                {getFilteredUnions().map(union => (
                  <SelectItem key={union.id} value={union.id}>
                    {union.name} ({union.bn_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>গ্রাম</Label>
            <Select 
              value={selectedLocation.village_id || 'all'} 
              onValueChange={(value) => handleLocationChange('village_id', value)}
              disabled={disabled || !selectedLocation.union_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="গ্রাম নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব গ্রাম</SelectItem>
                {getFilteredVillages().map(village => (
                  <SelectItem key={village.id} value={village.id}>
                    {village.name} ({village.bn_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoterLocationFilter;
