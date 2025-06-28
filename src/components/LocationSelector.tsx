
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getDivisions, getDistrictsByDivision, getUpazilasByDistrict, getUnionsByUpazila } from '@/lib/locationUtils';

interface LocationSelectorProps {
  onLocationChange: (location: {
    division_id: string;
    district_id: string;
    upazila_id: string;
    union_id: string;
  }) => void;
  initialValues?: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
  };
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationChange, initialValues = {} }) => {
  const [selectedLocation, setSelectedLocation] = useState({
    division_id: initialValues.division_id || '',
    district_id: initialValues.district_id || '',
    upazila_id: initialValues.upazila_id || '',
    union_id: initialValues.union_id || ''
  });

  const [customInputs, setCustomInputs] = useState({
    district: '',
    upazila: '',
    union: ''
  });

  const [showCustomInput, setShowCustomInput] = useState({
    district: false,
    upazila: false,
    union: false
  });

  // Load divisions
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: getDivisions
  });

  // Load districts based on selected division
  const { data: districts = [] } = useQuery({
    queryKey: ['districts', selectedLocation.division_id],
    queryFn: () => getDistrictsByDivision(selectedLocation.division_id),
    enabled: !!selectedLocation.division_id
  });

  // Load upazilas based on selected district
  const { data: upazilas = [] } = useQuery({
    queryKey: ['upazilas', selectedLocation.district_id],
    queryFn: () => getUpazilasByDistrict(selectedLocation.district_id),
    enabled: !!selectedLocation.district_id
  });

  // Load unions based on selected upazila
  const { data: unions = [] } = useQuery({
    queryKey: ['unions', selectedLocation.upazila_id],
    queryFn: () => getUnionsByUpazila(selectedLocation.upazila_id),
    enabled: !!selectedLocation.upazila_id
  });

  const handleLocationChange = (field: string, value: string) => {
    const updated = { ...selectedLocation, [field]: value };
    
    // Reset dependent fields when parent changes
    if (field === 'division_id') {
      updated.district_id = '';
      updated.upazila_id = '';
      updated.union_id = '';
      setShowCustomInput({ district: false, upazila: false, union: false });
    } else if (field === 'district_id') {
      updated.upazila_id = '';
      updated.union_id = '';
      setShowCustomInput({ ...showCustomInput, upazila: false, union: false });
    } else if (field === 'upazila_id') {
      updated.union_id = '';
      setShowCustomInput({ ...showCustomInput, union: false });
    }
    
    setSelectedLocation(updated);
    onLocationChange(updated);
  };

  const handleCustomInput = (type: 'district' | 'upazila' | 'union') => {
    const customValue = customInputs[type];
    if (customValue.trim()) {
      // Generate a temporary ID for the custom location
      const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (type === 'district') {
        handleLocationChange('district_id', customId);
      } else if (type === 'upazila') {
        handleLocationChange('upazila_id', customId);
      } else if (type === 'union') {
        handleLocationChange('union_id', customId);
      }
      
      setShowCustomInput({ ...showCustomInput, [type]: false });
      setCustomInputs({ ...customInputs, [type]: '' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="division">বিভাগ *</Label>
        <Select value={selectedLocation.division_id} onValueChange={(value) => handleLocationChange('division_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((division) => (
              <SelectItem key={division.id} value={division.id}>
                {division.bn_name} ({division.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="district">জেলা *</Label>
        <div className="flex gap-2">
          <Select 
            value={selectedLocation.district_id} 
            onValueChange={(value) => handleLocationChange('district_id', value)}
            disabled={!selectedLocation.division_id}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="জেলা নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.bn_name} ({district.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput({ ...showCustomInput, district: !showCustomInput.district })}
            disabled={!selectedLocation.division_id}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {showCustomInput.district && (
          <div className="flex gap-2">
            <Input
              placeholder="নতুন জেলার নাম লিখুন"
              value={customInputs.district}
              onChange={(e) => setCustomInputs({ ...customInputs, district: e.target.value })}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleCustomInput('district')}
            >
              যোগ করুন
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="upazila">উপজেলা *</Label>
        <div className="flex gap-2">
          <Select 
            value={selectedLocation.upazila_id} 
            onValueChange={(value) => handleLocationChange('upazila_id', value)}
            disabled={!selectedLocation.district_id}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {upazilas.map((upazila) => (
                <SelectItem key={upazila.id} value={upazila.id}>
                  {upazila.bn_name} ({upazila.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput({ ...showCustomInput, upazila: !showCustomInput.upazila })}
            disabled={!selectedLocation.district_id}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {showCustomInput.upazila && (
          <div className="flex gap-2">
            <Input
              placeholder="নতুন উপজেলার নাম লিখুন"
              value={customInputs.upazila}
              onChange={(e) => setCustomInputs({ ...customInputs, upazila: e.target.value })}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleCustomInput('upazila')}
            >
              যোগ করুন
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="union">ইউনিয়ন (ঐচ্ছিক)</Label>
        <div className="flex gap-2">
          <Select 
            value={selectedLocation.union_id} 
            onValueChange={(value) => handleLocationChange('union_id', value)}
            disabled={!selectedLocation.upazila_id}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {unions.map((union) => (
                <SelectItem key={union.id} value={union.id}>
                  {union.bn_name} ({union.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput({ ...showCustomInput, union: !showCustomInput.union })}
            disabled={!selectedLocation.upazila_id}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {showCustomInput.union && (
          <div className="flex gap-2">
            <Input
              placeholder="নতুন ইউনিয়নের নাম লিখুন"
              value={customInputs.union}
              onChange={(e) => setCustomInputs({ ...customInputs, union: e.target.value })}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleCustomInput('union')}
            >
              যোগ করুন
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
