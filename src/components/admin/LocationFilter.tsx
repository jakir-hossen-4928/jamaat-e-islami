
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { getDivisions, getDistrictsByDivision, getUpazilasByDistrict, getUnionsByUpazila } from '@/lib/locationUtils';

interface LocationFilterProps {
  onFilterChange: (filters: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
  }) => void;
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ onFilterChange, isVisible, onToggle }) => {
  const [filters, setFilters] = useState({
    division_id: '',
    district_id: '',
    upazila_id: '',
    union_id: ''
  });

  // Load divisions
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: getDivisions
  });

  // Load districts based on selected division
  const { data: districts = [] } = useQuery({
    queryKey: ['districts', filters.division_id],
    queryFn: () => getDistrictsByDivision(filters.division_id),
    enabled: !!filters.division_id
  });

  // Load upazilas based on selected district
  const { data: upazilas = [] } = useQuery({
    queryKey: ['upazilas', filters.district_id],
    queryFn: () => getUpazilasByDistrict(filters.district_id),
    enabled: !!filters.district_id
  });

  // Load unions based on selected upazila
  const { data: unions = [] } = useQuery({
    queryKey: ['unions', filters.upazila_id],
    queryFn: () => getUnionsByUpazila(filters.upazila_id),
    enabled: !!filters.upazila_id
  });

  const handleFilterChange = (field: string, value: string) => {
    const updated = { ...filters, [field]: value };
    
    // Reset dependent fields when parent changes
    if (field === 'division_id') {
      updated.district_id = '';
      updated.upazila_id = '';
      updated.union_id = '';
    } else if (field === 'district_id') {
      updated.upazila_id = '';
      updated.union_id = '';
    } else if (field === 'upazila_id') {
      updated.union_id = '';
    }
    
    setFilters(updated);
    
    // Send non-empty filters to parent
    const activeFilters = Object.entries(updated)
      .filter(([_, value]) => value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    onFilterChange(activeFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      division_id: '',
      district_id: '',
      upazila_id: '',
      union_id: ''
    };
    setFilters(clearedFilters);
    onFilterChange({});
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggle(true)}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        এলাকা ফিল্টার
      </Button>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">এলাকা ভিত্তিক ফিল্টার</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              সাফ করুন
            </Button>
            <Button variant="outline" size="sm" onClick={() => onToggle(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">বিভাগ</label>
            <Select value={filters.division_id} onValueChange={(value) => handleFilterChange('division_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="সব বিভাগ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">সব বিভাগ</SelectItem>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.bn_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">জেলা</label>
            <Select 
              value={filters.district_id} 
              onValueChange={(value) => handleFilterChange('district_id', value)}
              disabled={!filters.division_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="সব জেলা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">সব জেলা</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.bn_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">উপজেলা</label>
            <Select 
              value={filters.upazila_id} 
              onValueChange={(value) => handleFilterChange('upazila_id', value)}
              disabled={!filters.district_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="সব উপজেলা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">সব উপজেলা</SelectItem>
                {upazilas.map((upazila) => (
                  <SelectItem key={upazila.id} value={upazila.id}>
                    {upazila.bn_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ইউনিয়ন</label>
            <Select 
              value={filters.union_id} 
              onValueChange={(value) => handleFilterChange('union_id', value)}
              disabled={!filters.upazila_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="সব ইউনিয়ন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">সব ইউনিয়ন</SelectItem>
                {unions.map((union) => (
                  <SelectItem key={union.id} value={union.id}>
                    {union.bn_name}
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

export default LocationFilter;
