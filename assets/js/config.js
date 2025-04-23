/**
 * ARK Realestate - Configuration Settings
 * This file contains application-wide settings and configurations
 */

const ARK_CONFIG = {
    // Application Information
    appName: 'ARK Realestate',
    appVersion: '1.0.0',
    
    // API Endpoints (mock endpoints - would connect to real backend in production)
    api: {
        properties: '/api/properties',
        users: '/api/users',
        auth: '/api/auth',
        favorites: '/api/favorites',
        messages: '/api/messages',
        reviews: '/api/reviews',
        search: '/api/search'
    },
    
    // Property Types
    propertyTypes: [
        { id: 'house', label: 'House' },
        { id: 'apartment', label: 'Apartment' },
        { id: 'condo', label: 'Condominium' },
        { id: 'land', label: 'Land' },
        { id: 'commercial', label: 'Commercial' },
        { id: 'villa', label: 'Villa' },
        { id: 'office', label: 'Office Space' },
        { id: 'bungalow', label: 'Bungalow' }
    ],
    
    // Property Features
    propertyFeatures: [
        { id: 'parking', label: 'Parking' },
        { id: 'garden', label: 'Garden' },
        { id: 'pool', label: 'Swimming Pool' },
        { id: 'security', label: 'Security System' },
        { id: 'internet', label: 'High-Speed Internet' },
        { id: 'ac', label: 'Air Conditioning' },
        { id: 'heating', label: 'Central Heating' },
        { id: 'gym', label: 'Fitness Center' },
        { id: 'balcony', label: 'Balcony' },
        { id: 'elevator', label: 'Elevator' },
        { id: 'furnished', label: 'Furnished' },
        { id: 'pets', label: 'Pet Friendly' }
    ],
    
    // Property Status
    propertyStatus: [
        { id: 'sale', label: 'For Sale' },
        { id: 'rent', label: 'For Rent' },
        { id: 'leased', label: 'Leased' },
        { id: 'sold', label: 'Sold' },
        { id: 'pending', label: 'Sale Pending' }
    ],
    
    // Location Data (example cities - would be expanded in production)
    locations: [
        { id: 'new-york', label: 'New York', country: 'United States' },
        { id: 'los-angeles', label: 'Los Angeles', country: 'United States' },
        { id: 'chicago', label: 'Chicago', country: 'United States' },
        { id: 'miami', label: 'Miami', country: 'United States' },
        { id: 'london', label: 'London', country: 'United Kingdom' },
        { id: 'paris', label: 'Paris', country: 'France' },
        { id: 'berlin', label: 'Berlin', country: 'Germany' },
        { id: 'sydney', label: 'Sydney', country: 'Australia' },
        { id: 'tokyo', label: 'Tokyo', country: 'Japan' },
        { id: 'dubai', label: 'Dubai', country: 'UAE' }
    ],
    
    // User Roles
    userRoles: [
        { id: 'buyer', label: 'Buyer' },
        { id: 'seller', label: 'Seller' },
        { id: 'agent', label: 'Agent' },
        { id: 'admin', label: 'Administrator' }
    ],
    
    // Default Settings
    defaults: {
        currency: 'USD',
        currencySymbol: '$',
        listingsPerPage: 12,
        searchRadius: 50 // in miles
    },
    
    // Social Media Links
    socialMedia: {
        facebook: 'https://facebook.com/arkrealestate',
        twitter: 'https://twitter.com/arkrealestate',
        instagram: 'https://instagram.com/arkrealestate',
        linkedin: 'https://linkedin.com/company/arkrealestate'
    }
};

// Make config available globally
window.ARK_CONFIG = ARK_CONFIG; 