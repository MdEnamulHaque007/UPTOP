/**
 * Validation Utilities
 * Functions for validating form inputs and data
 */

const Validators = {
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {Object} - Validation result
     */
    email(email) {
        const result = { isValid: false, message: '' };
        
        if (!email || typeof email !== 'string') {
            result.message = 'Email is required';
            return result;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email.trim())) {
            result.message = 'Please enter a valid email address';
            return result;
        }
        
        if (email.length > CONFIG.VALIDATION.MAX_LENGTHS.EMAIL) {
            result.message = `Email must be less than ${CONFIG.VALIDATION.MAX_LENGTHS.EMAIL} characters`;
            return result;
        }
        
        result.isValid = true;
        return result;
    },
    
    /**
     * Validate required field
     * @param {*} value - Value to validate
     * @param {string} fieldName - Name of the field
     * @returns {Object} - Validation result
     */
    required(value, fieldName = 'Field') {
        const result = { isValid: false, message: '' };
        
        if (value === null || value === undefined) {
            result.message = `${fieldName} is required`;
            return result;
        }
        
        if (typeof value === 'string' && value.trim() === '') {
            result.message = `${fieldName} is required`;
            return result;
        }
        
        if (Array.isArray(value) && value.length === 0) {
            result.message = `${fieldName} is required`;
            return result;
        }
        
        result.isValid = true;
        return result;
    },
    
    /**
     * Validate string length
     * @param {string} value - String to validate
     * @param {number} minLength - Minimum length
     * @param {number} maxLength - Maximum length
     * @param {string} fieldName - Name of the field
     * @returns {Object} - Validation result
     */
    length(value, minLength = 0, maxLength = Infinity, fieldName = 'Field') {
        const result = { isValid: false, message: '' };
        
        if (!value || typeof value !== 'string') {
            if (minLength > 0) {
                result.message = `${fieldName} is required`;
                return result;
            } else {
                result.isValid = true;
                return result;
            }
        }
        
        const length = value.trim().length;
        
        if (length < minLength) {
            result.message = `${fieldName} must be at least ${minLength} characters`;
            return result;
        }
        
        if (length > maxLength) {
            result.message = `${fieldName} must be less than ${maxLength} characters`;
            return result;
        }
        
        result.isValid = true;
        return result;
    },
    
    /**
     * Validate numeric value
     * @param {*} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {string} fieldName - Name of the field
     * @returns {Object} - Validation result
     */
    number(value, min = -Infinity, max = Infinity, fieldName = 'Field') {
        const result = { isValid: false, message: '' };
        
        if (value === null || value === undefined || value === '') {
            result.message = `${fieldName} is required`;
            return result;
        }
        
        const num = Number(value);
        
        if (isNaN(num)) {
            result.message = `${fieldName} must be a valid number`;
            return result;
        }
        
        if (num < min) {
            result.message = `${fieldName} must be at least ${min}`;
            return result;
        }
        
        if (num > max) {
            result.message = `${fieldName} must be no more than ${max}`;
            return result;
        }
        
        result.isValid = true;
        return result;
    },
    
    /**
     * Validate integer value
     * @param {*} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {string} fieldName - Name of the field
     * @returns {Object} - Validation result
     */
    integer(value, min = -Infinity, max = Infinity, fieldName = 'Field') {
        const result = { isValid: false, message: '' };
        
        const numberResult = this.number(value, min, max, fieldName);
        if (!numberResult.isValid) {
            return numberResult;
        }
        
        const num = Number(value);
        
        if (!Number.isInteger(num)) {
            result.message = `${fieldName} must be a whole number`;
            return result;
        }
        
        result.isValid = true;
        return result;
    },
    
    /**
     * Validate positive number
     * @param {*} value - Value to validate
     * @param {string} fieldName - Name of the field
     * @returns {Object} - Validation result
     */
    positive(value, fieldName = 'Field') {
        return this.number(value, 0.01, Infinity, fieldName);
    },
    
    /**
     * Validate date
     * @param {*} value - Value to validate
     * @param {string} fieldName - Name of the field
     * @returns {Object} - Validation result
     */
    date(value, fieldName = 'Date') {
        const result = { isValid: false, message: '' };
        
        if (!value) {
            result.message = `${fieldName} is required`;
            return result;
        }
        
        const date = new Date(value);
        
        if (isNaN(date.getTime())) {
            result.message = `${fieldName} must be a valid date`;
            return result;
        }
        
        result.isValid = true;
        return result;
    },
    
    /**
     * Validate date range
     * @param {*} startDate - Start date
     * @param {*} endDate - End date
     * @param {string} startFieldName - Start field name
     * @param {string} endFieldName - End field name
     * @returns {Object} - Validation result
     */
    dateRange(startDate, endDate, startFieldName = 'Start date', endFieldName = 'End date') {
        const result = { isValid: false, message: '' };
        
        const startResult = this.date(startDate, startFieldName);
        if (!startResult.isValid) {
            return startResult;
        }
        
        const endResult = this.date(endDate, endFieldName);
        if (!endResult.isValid) {
            return endResult;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
            result.message = `${endFieldName} must be after ${startFieldName}`;
            return result;
        }
        
        result.isValid = true;
        return result;
    },
    
    /**
     * Validate phone number
     * @param {string} phone - Phone number to validate
     * @param {string} fieldName - Name of the field
     * @returns {Object} - Validation result
     */
    phone(phone, fieldName = 'Phone number') {
        const result = { isValid: false, message: '' };
        
        if (!phone || typeof phone !== 'string') {
            result.message = `${fieldName} is required`;
            return result;
        }
        
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length < 10) {
            result.message = `${fieldName} must be at least 10 digits`;
            return result;
        }
        
        if (cleaned.length > 15) {
            result.message = `${fieldName} must be no more than 15 digits`;
            return result;
        }
        
        result.isValid = true;
        return result;
    },
    
    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @param {string} fieldName - Name of the field
     * @returns {Object} - Validation result
     */
    url(url, fieldName = 'URL') {
        const result = { isValid: false, message: '' };
        
        if (!url || typeof url !== 'string') {
            result.message = `${fieldName} is required`;
            return result;
        }
        
        try {
            new URL(url);
            result.isValid = true;
        } catch {
            result.message = `${fieldName} must be a valid URL`;
        }
        
        return result;
    },
    
    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @param {Object} requirements - Password requirements
     * @returns {Object} - Validation result with strength score
     */
    password(password, requirements = {}) {
        const result = { 
            isValid: false, 
            message: '', 
            strength: 0,
            requirements: {
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false
            }
        };
        
        const defaults = {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumber: true,
            requireSpecial: true
        };
        
        const config = { ...defaults, ...requirements };
        
        if (!password || typeof password !== 'string') {
            result.message = 'Password is required';
            return result;
        }
        
        // Check length
        if (password.length >= config.minLength) {
            result.requirements.length = true;
            result.strength += 20;
        }
        
        // Check uppercase
        if (/[A-Z]/.test(password)) {
            result.requirements.uppercase = true;
            result.strength += 20;
        }
        
        // Check lowercase
        if (/[a-z]/.test(password)) {
            result.requirements.lowercase = true;
            result.strength += 20;
        }
        
        // Check numbers
        if (/\d/.test(password)) {
            result.requirements.number = true;
            result.strength += 20;
        }
        
        // Check special characters
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            result.requirements.special = true;
            result.strength += 20;
        }
        
        // Build error message
        const failedRequirements = [];
        
        if (!result.requirements.length) {
            failedRequirements.push(`at least ${config.minLength} characters`);
        }
        if (config.requireUppercase && !result.requirements.uppercase) {
            failedRequirements.push('an uppercase letter');
        }
        if (config.requireLowercase && !result.requirements.lowercase) {
            failedRequirements.push('a lowercase letter');
        }
        if (config.requireNumber && !result.requirements.number) {
            failedRequirements.push('a number');
        }
        if (config.requireSpecial && !result.requirements.special) {
            failedRequirements.push('a special character');
        }
        
        if (failedRequirements.length > 0) {
            result.message = `Password must contain ${failedRequirements.join(', ')}`;
            return result;
        }
        
        result.isValid = true;
        return result;
    },
    
    /**
     * Validate form data against rules
     * @param {Object} data - Form data to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} - Validation result with errors
     */
    validateForm(data, rules) {
        const result = {
            isValid: true,
            errors: {},
            hasErrors: false
        };
        
        for (const field in rules) {
            const fieldRules = rules[field];
            const value = data[field];
            
            for (const rule of fieldRules) {
                const { type, params = [], message } = rule;
                
                let validationResult;
                
                switch (type) {
                    case 'required':
                        validationResult = this.required(value, field);
                        break;
                    case 'email':
                        validationResult = this.email(value);
                        break;
                    case 'length':
                        validationResult = this.length(value, ...params, field);
                        break;
                    case 'number':
                        validationResult = this.number(value, ...params, field);
                        break;
                    case 'integer':
                        validationResult = this.integer(value, ...params, field);
                        break;
                    case 'positive':
                        validationResult = this.positive(value, field);
                        break;
                    case 'date':
                        validationResult = this.date(value, field);
                        break;
                    case 'phone':
                        validationResult = this.phone(value, field);
                        break;
                    case 'url':
                        validationResult = this.url(value, field);
                        break;
                    case 'password':
                        validationResult = this.password(value, params[0]);
                        break;
                    default:
                        console.warn(`Unknown validation type: ${type}`);
                        continue;
                }
                
                if (!validationResult.isValid) {
                    result.isValid = false;
                    result.hasErrors = true;
                    result.errors[field] = message || validationResult.message;
                    break; // Stop at first error for this field
                }
            }
        }
        
        return result;
    },
    
    /**
     * Validate inventory data based on type
     * @param {Object} data - Data to validate
     * @param {string} type - Data type (PURCHASE_ORDER, PRODUCTION, etc.)
     * @returns {Object} - Validation result
     */
    validateInventoryData(data, type) {
        const requiredFields = CONFIG.VALIDATION.REQUIRED_FIELDS[type];
        
        if (!requiredFields) {
            return { isValid: true, errors: {} };
        }
        
        const rules = {};
        
        // Build validation rules based on required fields
        requiredFields.forEach(field => {
            rules[field] = [{ type: 'required' }];
            
            // Add specific validation based on field name
            if (field.includes('amount') || field.includes('price') || field.includes('value')) {
                rules[field].push({ type: 'positive' });
            }
            
            if (field.includes('quantity')) {
                rules[field].push({ type: 'integer', params: [1] });
            }
            
            if (field.includes('date')) {
                rules[field].push({ type: 'date' });
            }
            
            if (field.includes('email')) {
                rules[field].push({ type: 'email' });
            }
        });
        
        return this.validateForm(data, rules);
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Validators = Validators;
}
