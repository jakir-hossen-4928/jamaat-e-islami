
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LocationSelector from '@/components/LocationSelector';
import { getFullLocationHierarchy } from '@/lib/locationUtils';

const LocationDemo = () => {
  const [selectedLocation, setSelectedLocation] = useState<{
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    ward_id?: string;
    village_id?: string;
  }>({});

  const [locationHierarchy, setLocationHierarchy] = useState<{
    division: string;
    district: string;
    upazila: string;
    union: string;
    ward: string;
    village: string;
  }>({
    division: '',
    district: '',
    upazila: '',
    union: '',
    ward: '',
    village: ''
  });

  const handleLocationChange = async (locationIds: {
    division_id?: string;
    district_id?: string;
    upazila_id?: string;
    union_id?: string;
    ward_id?: string;
    village_id?: string;
  }) => {
    setSelectedLocation(locationIds);
    
    // Get full hierarchy for display
    const hierarchy = await getFullLocationHierarchy(locationIds);
    setLocationHierarchy({
      division: hierarchy.division,
      district: hierarchy.district,
      upazila: hierarchy.upazila,
      union: hierarchy.union,
      ward: '', // Placeholder for ward
      village: '' // Placeholder for village
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            সরকারি প্ল্যাটফর্ম ডেমো
          </h1>
          <p className="text-gray-600">
            বাংলাদেশের প্রশাসনিক অঞ্চল নির্বাচন সিস্টেম
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Selector */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">প্রশাসনিক অঞ্চল নির্বাচন করুন</h2>
              <p className="text-sm text-gray-600">বাংলাদেশের সকল প্রশাসনিক স্তর</p>
            </div>
            <LocationSelector
              onLocationChange={handleLocationChange}
              initialValues={{
                division_id: selectedLocation.division_id,
                district_id: selectedLocation.district_id,
                upazila_id: selectedLocation.upazila_id,
                union_id: selectedLocation.union_id
              }}
            />
          </div>

          {/* Selected Location Display */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>নির্বাচিত অবস্থান</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Hierarchy */}
                <div className="space-y-2">
                  {locationHierarchy.division && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        বিভাগ
                      </Badge>
                      <span className="font-medium">{locationHierarchy.division}</span>
                    </div>
                  )}
                  
                  {locationHierarchy.district && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        জেলা
                      </Badge>
                      <span className="font-medium">{locationHierarchy.district}</span>
                    </div>
                  )}
                  
                  {locationHierarchy.upazila && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        উপজেলা
                      </Badge>
                      <span className="font-medium">{locationHierarchy.upazila}</span>
                    </div>
                  )}
                  
                  {locationHierarchy.union && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        ইউনিয়ন
                      </Badge>
                      <span className="font-medium">{locationHierarchy.union}</span>
                    </div>
                  )}
                  
                  {locationHierarchy.ward && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        ওয়ার্ড
                      </Badge>
                      <span className="font-medium">{locationHierarchy.ward}</span>
                    </div>
                  )}
                  
                  {locationHierarchy.village && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        গ্রাম/এলাকা
                      </Badge>
                      <span className="font-medium">{locationHierarchy.village}</span>
                    </div>
                  )}
                </div>

                {/* Raw IDs for debugging */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">ID গুলি:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {Object.entries(selectedLocation).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span className="font-mono">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">৮টি বিভাগ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                বাংলাদেশের মোট ৮টি প্রশাসনিক বিভাগ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">৬৪টি জেলা</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                ৮টি বিভাগে মোট ৬৪টি জেলা রয়েছে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">৪৯৫+ উপজেলা</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                ৬৪টি জেলায় ৪৯৫+ উপজেলা রয়েছে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">৪,৫০০+ ইউনিয়ন</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                উপজেলাগুলোতে ৪,৫০০+ ইউনিয়ন রয়েছে
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocationDemo;
