
import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    const fullTitle = title === 'Bangladesh Jamaat-e-Islami' 
      ? 'Bangladesh Jamaat-e-Islami - Voter Management System'
      : `${title} | Bangladesh Jamaat-e-Islami - Voter Management System`;
    
    document.title = fullTitle;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
