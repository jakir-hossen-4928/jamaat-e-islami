
import { VoterData } from '@/lib/types';

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  validRowCount: number;
  totalRowCount: number;
}

export class BulkUploadValidator {
  private static requiredFields = ['Voter Name'];
  
  private static fieldValidators: { [key: string]: (value: any, rowIndex: number) => ValidationError | null } = {
    'Voter Name': (value, rowIndex) => {
      if (!value || value.toString().trim() === '') {
        return { 
          row: rowIndex + 2, 
          field: 'Voter Name', 
          message: 'Voter Name is required and cannot be empty',
          severity: 'error'
        };
      }
      if (value.toString().length < 2) {
        return { 
          row: rowIndex + 2, 
          field: 'Voter Name', 
          message: 'Voter Name must be at least 2 characters long',
          severity: 'error'
        };
      }
      return null;
    },
    
    Age: (value, rowIndex) => {
      if (value && value !== '') {
        const age = parseInt(value.toString());
        if (isNaN(age) || age < 0 || age > 120) {
          return { 
            row: rowIndex + 2, 
            field: 'Age', 
            message: 'Age must be a valid number between 0 and 120',
            severity: 'error'
          };
        }
        if (age < 18) {
          return { 
            row: rowIndex + 2, 
            field: 'Age', 
            message: 'Age is below voting age (18)',
            severity: 'warning'
          };
        }
      }
      return null;
    },
    
    Gender: (value, rowIndex) => {
      if (value && !['Male', 'Female', 'Other', 'male', 'female', 'other'].includes(value.toString())) {
        return { 
          row: rowIndex + 2, 
          field: 'Gender', 
          message: 'Gender must be Male, Female, or Other',
          severity: 'error'
        };
      }
      return null;
    },
    
    Phone: (value, rowIndex) => {
      if (value && value !== '') {
        const phone = value.toString().replace(/\D/g, '');
        if (phone.length < 10 || phone.length > 15) {
          return { 
            row: rowIndex + 2, 
            field: 'Phone', 
            message: 'Phone number must be between 10-15 digits',
            severity: 'error'
          };
        }
        if (!phone.startsWith('01') && phone.length === 11) {
          return { 
            row: rowIndex + 2, 
            field: 'Phone', 
            message: 'Invalid Bangladesh phone number format',
            severity: 'warning'
          };
        }
      }
      return null;
    },
    
    'Vote Probability (%)': (value, rowIndex) => {
      if (value && value !== '') {
        const prob = parseInt(value.toString());
        if (isNaN(prob) || prob < 0 || prob > 100) {
          return { 
            row: rowIndex + 2, 
            field: 'Vote Probability (%)', 
            message: 'Vote Probability must be a number between 0 and 100',
            severity: 'error'
          };
        }
      }
      return null;
    },
    
    NID: (value, rowIndex) => {
      if (value && value !== '') {
        const nid = value.toString().replace(/\D/g, '');
        if (nid.length !== 10 && nid.length !== 13 && nid.length !== 17) {
          return { 
            row: rowIndex + 2, 
            field: 'NID', 
            message: 'NID must be 10, 13, or 17 digits',
            severity: 'warning'
          };
        }
      }
      return null;
    }
  };

  static normalizeColumnName(columnName: string): string {
    const normalized = columnName.trim();
    const mappings: { [key: string]: string } = {
      'voter name': 'Voter Name',
      'name': 'Voter Name',
      'full name': 'Voter Name',
      'age': 'Age',
      'gender': 'Gender',
      'phone': 'Phone',
      'mobile': 'Phone',
      'nid': 'NID',
      'vote probability': 'Vote Probability (%)',
      'village': 'Village Name',
      'village name': 'Village Name'
    };
    
    return mappings[normalized.toLowerCase()] || normalized;
  }

  static validateData(data: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let validRowCount = 0;
    
    data.forEach((row, index) => {
      let rowHasErrors = false;
      
      Object.keys(row).forEach((key) => {
        const normalizedKey = this.normalizeColumnName(key);
        const validator = this.fieldValidators[normalizedKey];
        
        if (validator) {
          const result = validator(row[key], index);
          if (result) {
            if (result.severity === 'error') {
              errors.push(result);
              rowHasErrors = true;
            } else {
              warnings.push(result);
            }
          }
        }
      });
      
      if (!rowHasErrors) {
        validRowCount++;
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validRowCount,
      totalRowCount: data.length
    };
  }

  static transformRowData(row: any): Partial<VoterData> {
    const transformed: any = {};
    
    Object.keys(row).forEach(key => {
      const normalizedKey = this.normalizeColumnName(key);
      let value = row[key];
      
      if (value !== null && value !== undefined && value !== '') {
        // Convert string values to proper case
        if (['Gender', 'Marital Status'].includes(normalizedKey)) {
          value = value.toString().charAt(0).toUpperCase() + value.toString().slice(1).toLowerCase();
        }
        
        // Convert Yes/No values
        if (['Student', 'Will Vote', 'Voted Before', 'Has Disability', 'Is Migrated'].includes(normalizedKey)) {
          value = ['yes', 'true', '1'].includes(value.toString().toLowerCase()) ? 'Yes' : 
                 ['no', 'false', '0'].includes(value.toString().toLowerCase()) ? 'No' : value;
        }
        
        // Convert numbers
        if (['Age', 'Vote Probability (%)'].includes(normalizedKey)) {
          const num = parseInt(value.toString());
          value = isNaN(num) ? undefined : num;
        }
        
        // Clean phone numbers
        if (normalizedKey === 'Phone') {
          value = value.toString().replace(/\D/g, '');
        }
        
        if (value !== undefined) {
          transformed[normalizedKey] = value;
        }
      }
    });
    
    return transformed;
  }
}
