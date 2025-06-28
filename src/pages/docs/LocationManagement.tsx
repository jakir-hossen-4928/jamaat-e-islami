
import React from 'react';
import DocumentationLayout from '@/components/layout/DocumentationLayout';
import LocationDocumentation from '@/components/documentation/LocationDocumentation';
import { usePageTitle } from '@/lib/usePageTitle';

const LocationManagement = () => {
  usePageTitle('এলাকা ব্যবস্থাপনা ডকুমেন্টেশন');

  return (
    <DocumentationLayout>
      <LocationDocumentation />
    </DocumentationLayout>
  );
};

export default LocationManagement;
