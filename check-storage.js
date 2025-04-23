/**
 * ARK Realestate - LocalStorage Checker
 * This script displays the contents of localStorage for debugging purposes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load localStorage data when page loads
    loadStorageData();
    
    // Add event listeners to buttons
    document.getElementById('refreshBtn').addEventListener('click', loadStorageData);
    document.getElementById('logoutBtn').addEventListener('click', logoutCurrentUser);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllData);
});

/**
 * Load and display all localStorage data
 */
function loadStorageData() {
    // Current user
    const currentUserElement = document.getElementById('currentUser');
    try {
        const currentUser = JSON.parse(localStorage.getItem('ark_user')) || null;
        currentUserElement.textContent = formatJSON(currentUser);
        
        // Highlight if user is logged in
        if (currentUser) {
            currentUserElement.style.color = '#27ae60';
        } else {
            currentUserElement.style.color = '#e74c3c';
            currentUserElement.textContent = 'No user is currently logged in.';
        }
    } catch (error) {
        currentUserElement.textContent = `Error reading current user: ${error.message}`;
        currentUserElement.style.color = '#e74c3c';
    }
    
    // All users
    const allUsersElement = document.getElementById('allUsers');
    try {
        const allUsers = JSON.parse(localStorage.getItem('ark_users')) || [];
        
        if (allUsers.length > 0) {
            // Make a copy to avoid modifying the original
            const usersCopy = JSON.parse(JSON.stringify(allUsers));
            
            // Mask passwords for security
            usersCopy.forEach(user => {
                if (user.password) {
                    user.password = '********';
                }
            });
            
            allUsersElement.textContent = formatJSON(usersCopy);
        } else {
            allUsersElement.textContent = 'No users found in storage.';
            allUsersElement.style.color = '#e74c3c';
        }
    } catch (error) {
        allUsersElement.textContent = `Error reading users: ${error.message}`;
        allUsersElement.style.color = '#e74c3c';
    }
    
    // Favorites
    const favoritesElement = document.getElementById('favorites');
    try {
        const favorites = JSON.parse(localStorage.getItem('ark_favorites')) || [];
        if (favorites.length > 0) {
            favoritesElement.textContent = formatJSON(favorites);
        } else {
            favoritesElement.textContent = 'No favorites stored.';
            favoritesElement.style.color = '#777';
        }
    } catch (error) {
        favoritesElement.textContent = `Error reading favorites: ${error.message}`;
        favoritesElement.style.color = '#e74c3c';
    }
    
    // Properties
    const propertiesElement = document.getElementById('properties');
    try {
        const properties = JSON.parse(localStorage.getItem('ark_properties')) || [];
        if (properties.length > 0) {
            propertiesElement.textContent = formatJSON(properties);
        } else {
            propertiesElement.textContent = 'No properties stored.';
            propertiesElement.style.color = '#777';
        }
    } catch (error) {
        propertiesElement.textContent = `Error reading properties: ${error.message}`;
        propertiesElement.style.color = '#e74c3c';
    }
}

/**
 * Format JSON with indentation for better readability
 */
function formatJSON(data) {
    return JSON.stringify(data, null, 2);
}

/**
 * Logout the current user
 */
function logoutCurrentUser() {
    if (confirm('Are you sure you want to log out the current user?')) {
        localStorage.removeItem('ark_user');
        alert('User logged out successfully.');
        loadStorageData();
    }
}

/**
 * Clear all application data from localStorage
 */
function clearAllData() {
    if (confirm('WARNING: This will delete ALL application data including users, favorites, and properties. Continue?')) {
        localStorage.removeItem('ark_user');
        localStorage.removeItem('ark_users');
        localStorage.removeItem('ark_favorites');
        localStorage.removeItem('ark_properties');
        alert('All application data has been cleared.');
        loadStorageData();
    }
} 