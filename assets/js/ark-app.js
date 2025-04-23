/**
 * ARK Realestate - Core Application Logic
 * This file handles the main functionality of the website
 */

// Initialize ARK Realestate application
const ARKRealestate = {
    // Application state
    state: {
        currentUser: null,
        favorites: [],
        searchParams: {},
        isLoading: false,
        notifications: []
    },

    // Initialize the application
    init: function() {
        console.log('Initializing ARK Realestate application...');
        
        // Initialize application state
        this.state = {
            isLoading: false,
            currentUser: null,
            searchParams: {},
            favorites: []
        };
        
        // Set up logout event listener first
        this.setupLogoutListener();
        
        // Check and validate localStorage availability
        this.validateLocalStorage();
        
        // Check if user is logged in
        this.checkAuth();
        console.log('Auth check completed, current user:', this.state.currentUser ? this.state.currentUser.email : 'none');
        
        // Update UI based on authentication status
        if (this.state.currentUser) {
            this.updateUIForLoggedInUser();
        } else {
            this.updateUIForLoggedOutUser();
        }
        
        // Setup protected pages - This must run before any other page-specific code
        // If this returns false, the user is being redirected and we should stop initialization
        if (!this.setupProtectedPages()) {
            console.log('Protected page access denied - stopping initialization');
            return;
        }
        
        // Continue with initialization if we passed protection check
        
        // Load favorites from localStorage
        this.loadFavorites();
        
        // Setup event listeners for forms
        this.setupEventListeners();
        
        // Populate profile page if we're on it
        this.populateProfilePage();
        
        // For demo purposes, generate some properties
        this.generateMockProperties();
        
        console.log('ARK Realestate application initialized');
    },

    // Set up logout handler
    setupLogoutListener: function() {
        // Find all logout buttons on the page
        const logoutBtns = document.querySelectorAll('.user__profile--log-out__btn, .logout-btn');
        
        if (logoutBtns.length > 0) {
            console.log('Found logout buttons:', logoutBtns.length);
            
            // Attach click event to each logout button
            logoutBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            });
        }
    },

    // Handle logout
    handleLogout: function() {
        console.log('Logout handler called');
        
        // Clear user data from localStorage
        try {
            localStorage.removeItem('ark_user');
            this.state.currentUser = null;
            console.log('User logged out successfully');
            
            // Update UI for logged out user
            this.updateUIForLoggedOutUser();
            
            // Show notification
            this.showNotification('Logged out successfully', 'success');
            
            // Redirect to login page
            const baseUrl = this.getBaseUrl();
            setTimeout(() => {
                window.location.replace(`${baseUrl}/login.html`);
            }, 500);
        } catch (error) {
            console.error('Error during logout:', error);
            this.showNotification('Error logging out', 'error');
        }
    },

    // Validate localStorage availability
    validateLocalStorage: function() {
        console.log('Validating localStorage...');
        
        try {
            // Test localStorage availability
            if (typeof localStorage === 'undefined') {
                console.error('localStorage is not available');
                return false;
            }
            
            // Try to read and write a test value
            localStorage.setItem('ark_test', 'test');
            const testValue = localStorage.getItem('ark_test');
            localStorage.removeItem('ark_test');
            
            if (testValue !== 'test') {
                console.error('localStorage test failed');
                return false;
            }
            
            // Initialize required objects if they don't exist
            if (!localStorage.getItem('ark_users')) {
                console.log('Initializing ark_users in localStorage');
                localStorage.setItem('ark_users', JSON.stringify([]));
            }
            
            if (!localStorage.getItem('ark_properties')) {
                console.log('Initializing ark_properties in localStorage');
                localStorage.setItem('ark_properties', JSON.stringify([]));
            }
            
            if (!localStorage.getItem('ark_favorites')) {
                console.log('Initializing ark_favorites in localStorage');
                localStorage.setItem('ark_favorites', JSON.stringify([]));
            }
            
            console.log('localStorage validation successful');
            return true;
        } catch (error) {
            console.error('Error validating localStorage:', error);
            return false;
        }
    },

    // Load favorites from localStorage
    loadFavorites: function() {
        try {
            const favorites = localStorage.getItem('ark_favorites');
            if (favorites) {
                this.state.favorites = JSON.parse(favorites);
                console.log('Loaded favorites from localStorage:', this.state.favorites.length);
            } else {
                this.state.favorites = [];
                console.log('No favorites found in localStorage');
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            this.state.favorites = [];
        }
    },

    // Load configuration
    loadConfig: function() {
        if (!window.ARK_CONFIG) {
            console.error('ARK_CONFIG not found. Make sure config.js is loaded before ark-app.js');
            return;
        }
        
        console.log('Configuration loaded:', window.ARK_CONFIG.appName, window.ARK_CONFIG.appVersion);
        
        // Set page title if not already set
        if (document.title === 'ARK Realestate - Your Dream Property Awaits') {
            document.title = window.ARK_CONFIG.appName + ' - Your Dream Property Awaits';
        }
    },

    // Set up event listeners
    setupEventListeners: function() {
        console.log('Setting up event listeners');
        
        // Property search form
        const propertySearchForm = document.getElementById('property-search-form');
        if (propertySearchForm) {
            propertySearchForm.addEventListener('submit', this.handlePropertySearch.bind(this));
            console.log('Property search form listener added');
        }
        
        // Login form
        const loginForm = document.getElementById('login');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
            console.log('Login form listener added');
        }
        
        // Signup form
        const signupForm = document.getElementById('signup');
        if (signupForm) {
            signupForm.addEventListener('submit', this.handleSignup.bind(this));
            console.log('Signup form listener added');
        }
        
        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactSubmission.bind(this));
            console.log('Contact form listener added');
        }
        
        // Setup property filtering
        this.setupPropertySearch();
        
        // Setup favorites toggle
        this.setupFavoritesToggle();
    },

    // Populate data from configuration
    populateDataFromConfig: function() {
        // Populate property type dropdowns
        const propertyTypeSelects = document.querySelectorAll('.property-type-select');
        if (propertyTypeSelects.length > 0 && window.ARK_CONFIG.propertyTypes) {
            propertyTypeSelects.forEach(select => {
                window.ARK_CONFIG.propertyTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = type.label;
                    select.appendChild(option);
                });
            });
        }
        
        // Populate location dropdowns
        const locationSelects = document.querySelectorAll('.location-select');
        if (locationSelects.length > 0 && window.ARK_CONFIG.locations) {
            locationSelects.forEach(select => {
                window.ARK_CONFIG.locations.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.id;
                    option.textContent = location.label;
                    select.appendChild(option);
                });
            });
        }
        
        // Populate status dropdowns
        const statusSelects = document.querySelectorAll('.status-select');
        if (statusSelects.length > 0 && window.ARK_CONFIG.propertyStatus) {
            statusSelects.forEach(select => {
                window.ARK_CONFIG.propertyStatus.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status.id;
                    option.textContent = status.label;
                    select.appendChild(option);
                });
            });
        }
        
        // Set currency symbol in price elements
        const currencyElements = document.querySelectorAll('.currency-symbol');
        if (currencyElements.length > 0) {
            currencyElements.forEach(element => {
                element.textContent = window.ARK_CONFIG.defaults.currencySymbol;
            });
        }
    },

    // Check authentication status
    checkAuth: function() {
        console.log('Checking authentication status...');
        
        try {
            // Try to get user data from localStorage
            const userData = localStorage.getItem('ark_user');
            
            if (userData) {
                // Parse user data
                const user = JSON.parse(userData);
                
                // Make sure we have at least basic user properties
                if (user && user.id && user.email) {
                    console.log('User authenticated:', user.email);
                    
                    // Set current user in application state
                    this.state.currentUser = user;
                    
                    // Verify that this user exists in our users list
                    const users = this.getUsers();
                    const userExists = users.some(u => u.email === user.email);
                    
                    if (!userExists) {
                        console.warn('Authenticated user not found in users list, adding them');
                        users.push(user);
                        this.saveUsers(users);
                    }
                    
                    return true;
                } else {
                    console.warn('Invalid user data in localStorage');
                }
            } else {
                console.log('No user data found in localStorage');
            }
            
            // If we get here, authentication failed
            this.state.currentUser = null;
            return false;
        } catch (error) {
            console.error('Error checking authentication:', error);
            this.state.currentUser = null;
            return false;
        }
    },

    // Update UI for logged in user
    updateUIForLoggedInUser: function() {
        if (!this.state.currentUser) return;
        
        // Update all login links to show the user's name instead (desktop and mobile)
        const loginLinks = document.querySelectorAll('.login__register--link, .offcanvas__menu_item[href*="login.html"]');
        loginLinks.forEach(link => {
            // Replace the text with the user's name and logout icon
            const originalContent = link.innerHTML;
            
            // Create a container div for better styling
            const container = document.createElement('div');
            container.className = 'logged-in-container d-flex align-items-center';
            
            // Create the username element
            const nameSpan = document.createElement('span');
            nameSpan.className = 'user-name';
            nameSpan.textContent = this.state.currentUser.name;
            
            // Create logout icon
            const logoutIcon = document.createElement('span');
            logoutIcon.className = 'logout-icon ms-2';
            logoutIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;
            
            // Add tooltip title
            logoutIcon.title = "Logout";
            
            // Store the original content for later restoration
            link.dataset.originalContent = originalContent;
            
            // Clear existing content and add new elements
            link.innerHTML = '';
            container.appendChild(nameSpan);
            container.appendChild(logoutIcon);
            link.appendChild(container);
            
            // Change link to point to admin profile
            const baseUrl = this.getBaseUrl();
            link.href = `${baseUrl}/admin/profile.html`;
            
            // Prevent default on the parent link to let us handle clicks manually
            link.addEventListener('click', (e) => {
                // Allow normal navigation to the profile page
                return true;
            });
            
            // Add click event for logout icon
            logoutIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleLogout();
            });
        });
        
        // Add a logout menu item in the mobile menu
        const mobileMenuLogoutItem = document.querySelector('.mobile-menu-logout-item');
        if (!mobileMenuLogoutItem) {
            const offcanvasMenuUl = document.querySelector('.offcanvas__menu_ul');
            if (offcanvasMenuUl) {
                const logoutLi = document.createElement('li');
                logoutLi.className = 'offcanvas__menu_li mobile-menu-logout-item';
                logoutLi.innerHTML = `
                    <a class="offcanvas__menu_item logout-btn" href="javascript:void(0)">
                        <span>Logout</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </a>
                `;
                offcanvasMenuUl.appendChild(logoutLi);
                
                // Add event listener for the logout button
                const logoutBtn = logoutLi.querySelector('.logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleLogout();
                    });
                }
            }
        }
        
        // Add a profile link to the mobile menu if it doesn't exist
        const mobileMenuProfileItem = document.querySelector('.mobile-menu-profile-item');
        if (!mobileMenuProfileItem) {
            const offcanvasMenuUl = document.querySelector('.offcanvas__menu_ul');
            if (offcanvasMenuUl && this.state.currentUser) {
                const profileLi = document.createElement('li');
                profileLi.className = 'offcanvas__menu_li mobile-menu-profile-item';
                
                const baseUrl = this.getBaseUrl();
                profileLi.innerHTML = `
                    <a class="offcanvas__menu_item" href="${baseUrl}/admin/profile.html">
                        <span>My Profile</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </a>
                `;
                
                // Insert before the logout item if it exists
                if (mobileMenuLogoutItem) {
                    offcanvasMenuUl.insertBefore(profileLi, mobileMenuLogoutItem);
                } else {
                    offcanvasMenuUl.appendChild(profileLi);
                }
            }
        }
        
        // Update any profile buttons/links
        const profileButtons = document.querySelectorAll('.profile__button, .profile__link');
        profileButtons.forEach(button => {
            const baseUrl = this.getBaseUrl();
            button.href = `${baseUrl}/admin/profile.html`;
        });
        
        console.log('UI updated for logged in user:', this.state.currentUser.name);
    },

    // Update UI for logged out user
    updateUIForLoggedOutUser: function() {
        // Restore login/register links to original content (desktop and mobile)
        const loginLinks = document.querySelectorAll('.login__register--link, .offcanvas__menu_item[href*="login.html"]');
        loginLinks.forEach(link => {
            // Check if we have stored original content
            if (link.dataset.originalContent) {
                link.innerHTML = link.dataset.originalContent;
            } else {
                // Default fallback if original content was not stored
                link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-users"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> <span>Login / Register</span>`;
            }
            
            // Reset link to login page
            const baseUrl = this.getBaseUrl();
            link.href = `${baseUrl}/login.html`;
            
            // Remove any click handlers
            link.replaceWith(link.cloneNode(true));
        });
        
        // Remove the logout menu item if it exists
        const mobileMenuLogoutItem = document.querySelector('.mobile-menu-logout-item');
        if (mobileMenuLogoutItem) {
            mobileMenuLogoutItem.remove();
        }
        
        // Remove the profile menu item if it exists
        const mobileMenuProfileItem = document.querySelector('.mobile-menu-profile-item');
        if (mobileMenuProfileItem) {
            mobileMenuProfileItem.remove();
        }
        
        console.log('UI updated for logged out user');
    },

    // Handle property search
    handlePropertySearch: function(e) {
        e.preventDefault();
        this.state.isLoading = true;
        
        const form = e.target;
        const formData = new FormData(form);
        const searchParams = {};
        
        for (const [key, value] of formData.entries()) {
            searchParams[key] = value;
        }
        
        this.state.searchParams = searchParams;
        console.log('Search params:', searchParams);
        
        // In a real app, you would make an API call here
        // For demo, we'll just redirect to the listing page
        window.location.href = `listing.html?${new URLSearchParams(searchParams).toString()}`;
    },

    // Handle property filtering
    handlePropertyFilter: function(e) {
        e.preventDefault();
        const filterType = e.target.dataset.filter || e.target.closest('.property__filter--btn').dataset.filter;
        
        // Add active class to clicked filter and remove from others
        const filterBtns = document.querySelectorAll('.property__filter--btn');
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        e.target.closest('.property__filter--btn').classList.add('active');
        
        // In a real app, this would filter the properties
        console.log('Filtering properties by:', filterType);
    },

    // Toggle favorite status for a property
    toggleFavorite: function(propertyId) {
        if (!this.state.currentUser) {
            // Redirect to login if not logged in
            window.location.href = 'login.html';
            return;
        }
        
        const index = this.state.favorites.indexOf(propertyId);
        if (index === -1) {
            // Add to favorites
            this.state.favorites.push(propertyId);
            console.log('Added property to favorites:', propertyId);
        } else {
            // Remove from favorites
            this.state.favorites.splice(index, 1);
            console.log('Removed property from favorites:', propertyId);
        }
        
        // Update UI to reflect the change
        const favoriteBtn = document.querySelector(`.add__to--favorites[data-id="${propertyId}"]`);
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active');
        }
        
        // In a real app, you would make an API call here
        localStorage.setItem('ark_favorites', JSON.stringify(this.state.favorites));
    },

    // Get base URL for routing
    getBaseUrl: function() {
        const pathParts = window.location.pathname.split('/');
        let baseUrl = '';
        
        // Find the index of admin or the last directory before the HTML file
        const adminIndex = pathParts.indexOf('admin');
        const htmlIndex = pathParts.findIndex(part => part.endsWith('.html'));
        
        // Determine how many levels to go back
        let levelsBack = 0;
        if (adminIndex !== -1) {
            levelsBack = pathParts.length - adminIndex;
        } else if (htmlIndex !== -1) {
            levelsBack = 1;
        }
        
        // Build the base URL
        for (let i = 0; i < levelsBack; i++) {
            baseUrl += '../';
        }
        
        // Remove trailing slash if there is one
        baseUrl = baseUrl.replace(/\/$/, '');
        
        // If empty, use current directory
        if (baseUrl === '') {
            baseUrl = '.';
        }
        
        console.log('Calculated base URL:', baseUrl);
        return baseUrl;
    },

    // Handle login form submission
    handleLogin: function(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        try {
            // Find login form by ID or selector - handling both possible IDs
            const form = document.getElementById('login') || document.getElementById('login-form');
            if (!form) {
                console.error('Login form not found on page');
                this.showNotification('Login form not found', 'error');
                return;
            }
            
            console.log('Found login form with ID:', form.id);
            
            // Get form elements safely
            const emailInput = form.querySelector('input[name="email"]') || form.querySelector('#email');
            const passwordInput = form.querySelector('input[name="password"]') || form.querySelector('#password');
            const agreementCheckbox = form.querySelector('input[type="checkbox"]');
            
            if (!emailInput || !passwordInput) {
                console.error('Login form elements not found', {
                    emailFound: !!emailInput,
                    passwordFound: !!passwordInput
                });
                this.showNotification('Error processing login form', 'error');
                return;
            }
            
            const email = emailInput.value;
            const password = passwordInput.value;
            const isAgreementChecked = agreementCheckbox ? agreementCheckbox.checked : true;
            
            console.log('Login attempt for:', email);
            console.log('Agreement checked:', isAgreementChecked);
            
            // Validate all fields are filled and agreement is checked
            if (!email || !password) {
                this.showNotification('Please fill all required fields', 'error');
                return;
            }
            
            if (!isAgreementChecked) {
                this.showNotification('Please agree to the terms and conditions', 'error');
                return;
            }
            
            // Validate email format
            if (!this.validateEmail(email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Get users from localStorage
            let users = this.getUsers();
            
            // Find the user
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                console.log('User found, login successful');
                
                // Store the current user
                this.state.currentUser = user;
                localStorage.setItem('ark_user', JSON.stringify(user));
                
                // Update UI for logged in user
                this.updateUIForLoggedInUser();
                
                // Show success notification
                this.showNotification('Login successful!', 'success');
                
                // Check if we have a return URL from protection redirect
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('return');
                
                // Get base url for redirection
                const baseUrl = this.getBaseUrl();
                
                // Redirect to dashboard or return URL
                setTimeout(() => {
                    if (returnUrl) {
                        console.log('Redirecting to return URL:', returnUrl);
                        window.location.replace(decodeURIComponent(returnUrl));
                    } else {
                        console.log('Redirecting to dashboard');
                        window.location.replace(`${baseUrl}/admin/index.html`);
                    }
                }, 500);
            } else {
                console.log('User not found or password incorrect');
                this.showNotification('Invalid email or password', 'error');
            }
        } catch (error) {
            console.error('Error during login:', error);
            this.showNotification('Login failed: ' + error.message, 'error');
        }
    },

    // Handle signup form submission
    handleSignup: function(e) {
        e.preventDefault();
        console.log('Signup form submitted');
        
        try {
            // Get signup form
            const form = document.getElementById('signup-form');
            if (!form) {
                console.error('Signup form not found');
                this.showNotification('Signup form not found', 'error');
                return;
            }
            
            // Get form data
            const name = form.querySelector('[name="name"]').value;
            const email = form.querySelector('[name="email"]').value;
            const password = form.querySelector('[name="password"]').value;
            const confirmPassword = form.querySelector('[name="password2"]').value;
            
            // Optional fields - get them if they exist
            const phone = form.querySelector('[name="phone"]') ? form.querySelector('[name="phone"]').value : '';
            const location = form.querySelector('[name="location"]') ? form.querySelector('[name="location"]').value : '';
            const birthday = form.querySelector('[name="birthday"]') ? form.querySelector('[name="birthday"]').value : '';
            const jobTitle = form.querySelector('[name="job_title"]') ? form.querySelector('[name="job_title"]').value : '';
            
            // Check agreement checkbox
            const agreementCheckbox = form.querySelector('input[type="checkbox"]');
            const isAgreementChecked = agreementCheckbox ? agreementCheckbox.checked : true;
            
            console.log('Signup attempt for:', email);
            console.log('Agreement checked:', isAgreementChecked);
            
            // Validate required fields
            if (!name || !email || !password || !confirmPassword) {
                this.showNotification('Please fill all required fields', 'error');
                return;
            }
            
            // Check agreement checkbox
            if (!isAgreementChecked) {
                this.showNotification('Please agree to the terms and conditions', 'error');
                return;
            }
            
            // Validate email format
            if (!this.validateEmail(email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Validate password match
            if (password !== confirmPassword) {
                this.showNotification('Passwords do not match', 'error');
                return;
            }
            
            // Get existing users
            let users = this.getUsers();
            
            // Check if user already exists
            if (users.some(user => user.email === email)) {
                console.log('User already exists with email:', email);
                this.showNotification('A user with this email already exists', 'error');
                return;
            }
            
            // Create new user object with all profile information
            const newUser = {
                id: 'user_' + Date.now(),
                name: name,
                email: email,
                password: password,
                phone: phone || '',
                location: location || '',
                birthday: birthday || '',
                jobTitle: jobTitle || '',
                role: 'user',
                createdAt: new Date().toISOString()
            };
            
            console.log('Creating new user:', newUser);
            
            // Add user to the users array
            users.push(newUser);
            
            // Save users to localStorage
            if (this.saveUsers(users)) {
                console.log('User added successfully');
                
                // Set current user for this session
                this.state.currentUser = newUser;
                
                // Also store the current user in localStorage for session persistence
                localStorage.setItem('ark_user', JSON.stringify(newUser));
                
                // Update UI for logged in user
                this.updateUIForLoggedInUser();
                
                // Show success notification
                this.showNotification('Account created successfully!', 'success');
                
                // Get base URL for redirection
                const baseUrl = this.getBaseUrl();
                
                // Redirect to dashboard
                setTimeout(() => {
                    console.log('Redirecting to dashboard');
                    window.location.replace(`${baseUrl}/admin/index.html`);
                }, 500);
            } else {
                console.error('Failed to save user');
                this.showNotification('Failed to create account', 'error');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            this.showNotification('Signup failed: ' + error.message, 'error');
        }
    },

    // Handle contact form submission
    handleContactSubmission: function(e) {
        e.preventDefault();
        const name = e.target.elements.name.value;
        const email = e.target.elements.email.value;
        const subject = e.target.elements.subject.value;
        const message = e.target.elements.message.value;
        
        // For demo purposes, we'll just log the form data
        console.log('Contact form submitted:', { name, email, subject, message });
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        e.target.reset();
    },

    // Generate mock properties for demo purposes
    generateMockProperties: function() {
        // This function would typically be replaced by an API call
        const mockProperties = [
            {
                id: 'prop1',
                title: 'Modern Apartment in Downtown',
                price: 450000,
                location: 'New York',
                bedrooms: 2,
                bathrooms: 2,
                area: 1200,
                type: 'apartment',
                status: 'sale',
                image: 'assets/img/product/product1.png'
            },
            {
                id: 'prop2',
                title: 'Luxury Villa with Pool',
                price: 1250000,
                location: 'Miami',
                bedrooms: 4,
                bathrooms: 3,
                area: 3200,
                type: 'villa',
                status: 'sale',
                image: 'assets/img/product/product2.png'
            },
            {
                id: 'prop3',
                title: 'Cozy Studio for Rent',
                price: 1800,
                location: 'Chicago',
                bedrooms: 1,
                bathrooms: 1,
                area: 650,
                type: 'apartment',
                status: 'rent',
                image: 'assets/img/product/product3.png'
            }
        ];
        
        // Store in localStorage for demo purposes
        localStorage.setItem('ark_properties', JSON.stringify(mockProperties));
    },

    // Show notification/toast message
    showNotification: function(message, type = 'info') {
        console.log(`Notification (${type}):`, message);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `ark-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
            </div>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '4px',
            zIndex: '9999',
            maxWidth: '300px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            animation: 'fadeIn 0.3s, fadeOut 0.3s 2.7s'
        });
        
        // Set color based on type
        if (type === 'success') {
            notification.style.backgroundColor = '#4CAF50';
            notification.style.color = 'white';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#F44336';
            notification.style.color = 'white';
        } else {
            notification.style.backgroundColor = '#2196F3';
            notification.style.color = 'white';
        }
        
        // Add animation styles if they don't exist
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.innerHTML = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
        return notification;
    },

    // Setup protected pages for admin routes
    setupProtectedPages: function() {
        console.log('Setting up protected page access...');
        
        // Check if this is an admin page that requires protection
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.includes('/admin/') || currentPath.endsWith('/admin');
        
        if (isAdminPage) {
            console.log('Admin page detected, checking authentication...');
            
            // If no user is logged in, redirect to login page
            if (!this.state.currentUser) {
                console.log('No authenticated user found for admin page, redirecting to login');
                
                // Show notification
                this.showNotification('Please login to access admin pages', 'warning');
                
                // Get the base URL for redirection
                const baseUrl = this.getBaseUrl();
                
                // Store current page for redirection after login
                const returnUrl = encodeURIComponent(window.location.href);
                
                // Redirect to login page with return URL parameter
                setTimeout(() => {
                    window.location.replace(`${baseUrl}/login.html?return=${returnUrl}`);
                }, 500);
                
                // Return false to stop further initialization
                return false;
            }
            
            console.log('User authenticated, allowing admin page access');
        }
        
        // Return true to continue initialization
        return true;
    },
    
    // Populate the profile page with user data
    populateProfilePage: function() {
        console.log('Checking if we need to populate profile page...');
        
        // Check if this is the profile page by looking for profile elements
        const profileElements = document.querySelectorAll('.profile__author--title, .profile__info--list');
        
        if (profileElements.length > 0) {
            console.log('Profile elements found, populating profile...');
            
            // Double check authentication for security
            if (!this.state.currentUser) {
                console.warn('Attempt to populate profile page without authentication');
                
                // This is a protected page, redirect to login
                const baseUrl = this.getBaseUrl();
                this.showNotification('Please login to view profile', 'warning');
                
                setTimeout(() => {
                    window.location.replace(`${baseUrl}/login.html`);
                }, 500);
                
                return;
            }
            
            // Get the current user data
            const userData = this.state.currentUser;
            console.log('Current user data for profile:', userData);
            
            // Update profile with user data
            this.updateProfileDirectly(userData);
            
            // Force multiple refresh attempts to ensure the DOM is fully loaded
            setTimeout(() => {
                this.updateProfileElements(userData);
            }, 300);
            
            setTimeout(() => {
                this.updateProfileElements(userData);
            }, 800);

            // Set up a window load event listener to ensure DOM is fully loaded
            window.addEventListener('load', () => {
                console.log('Window load event: updating profile elements again');
                this.updateProfileElements(userData);
            });
        }
    },
    
    // Directly update profile elements with user data
    updateProfileDirectly: function(userData) {
        console.log('Directly updating profile with data:', userData);
        
        try {
            // Check if user data exists
            if (!userData || !userData.name) {
                console.error('Invalid user data for profile update:', userData);
                this.showNotification('Error loading profile data', 'error');
                return;
            }
            
            console.log('User data found, updating profile elements...');
            
            // IMPORTANT: Force a delay to ensure DOM elements are fully loaded
            setTimeout(() => {
                this.updateProfileElements(userData);
            }, 100);
        } catch (error) {
            console.error('Error directly updating profile:', error);
            this.showNotification('Error updating profile display', 'error');
        }
    },
    
    // Update profile elements with a delay to ensure DOM loading
    updateProfileElements: function(userData) {
        try {
            console.log('Attempting to update profile elements with user data:', userData);
            
            // Update header name in the top navbar
            const headerNameElement = document.querySelector('.header__user--profile__name');
            if (headerNameElement) {
                headerNameElement.textContent = userData.name;
                console.log('Updated header name to:', userData.name);
            } else {
                console.warn('Header name element not found');
            }
            
            // Update profile author title (the main name on the profile)
            const profileAuthorTitles = document.querySelectorAll('.profile__author--title');
            if (profileAuthorTitles && profileAuthorTitles.length > 0) {
                profileAuthorTitles.forEach(el => {
                    el.textContent = userData.name;
                    console.log('Updated profile author title to:', userData.name);
                });
            } else {
                console.warn('Profile author title elements not found');
            }
            
            // Update job title
            const profileSubtitles = document.querySelectorAll('.profile__author--subtitle');
            if (profileSubtitles && profileSubtitles.length > 0) {
                profileSubtitles.forEach(el => {
                    el.textContent = userData.jobTitle || 'User';
                    console.log('Updated job title to:', userData.jobTitle || 'User');
                });
            } else {
                console.warn('Profile subtitle elements not found');
            }
            
            // Update profile information elements
            const profileInfoLists = document.querySelectorAll('.profile__info--list');
            console.log('Found profile info lists:', profileInfoLists.length);
            
            if (profileInfoLists && profileInfoLists.length > 0) {
                profileInfoLists.forEach(item => {
                    const titleEl = item.querySelector('.profile__info--title');
                    const valueEl = item.querySelector('.profile__info__text');
                    
                    if (titleEl && valueEl) {
                        const titleText = titleEl.textContent.trim().toUpperCase();
                        console.log('Processing profile item:', titleText);
                        
                        // Update email information
                        if (titleText === 'EMAIL') {
                            const email = userData.email || 'Email not provided';
                            valueEl.textContent = email;
                            console.log('Updated email to:', email);
                            
                            if (valueEl.tagName === 'A') {
                                valueEl.href = 'mailto:' + email;
                            }
                        }
                        // Update phone information
                        else if (titleText === 'PHONE') {
                            const phone = userData.phone || 'Phone not provided';
                            valueEl.textContent = phone;
                            console.log('Updated phone to:', phone);
                            
                            if (valueEl.tagName === 'A') {
                                valueEl.href = 'tel:' + phone;
                            }
                        }
                        // Update birthday information
                        else if (titleText === 'BIRTHDAY') {
                            const birthday = userData.birthday || 'Birthday not provided';
                            valueEl.textContent = birthday;
                            console.log('Updated birthday to:', birthday);
                        }
                        // Update location information
                        else if (titleText === 'LOCATION') {
                            const location = userData.location || 'Location not provided';
                            valueEl.textContent = location;
                            console.log('Updated location to:', location);
                        }
                    }
                });
            }
            
            // Update all other elements with the user name class
            const userNameElements = document.querySelectorAll('.user-name');
            if (userNameElements && userNameElements.length > 0) {
                userNameElements.forEach(el => {
                    el.textContent = userData.name;
                });
                console.log('Updated user-name elements:', userNameElements.length);
            }
            
            console.log('Profile updated successfully with user data');
        } catch (error) {
            console.error('Error updating profile elements:', error);
        }
    },
    
    // Helper function to update profile images
    updateProfileImages: function(imageUrl) {
        try {
            // Update all profile images
            const profileImages = document.querySelectorAll('.profile__image img, .header__user--profile__thumb img');
            if (profileImages && profileImages.length > 0) {
                profileImages.forEach(function(img) {
                    img.src = imageUrl;
                });
                console.log(`Updated ${profileImages.length} profile images`);
            }
        } catch (error) {
            console.error('Error updating profile images:', error);
        }
    },

    // Get all users from localStorage
    getUsers: function() {
        try {
            const storedUsers = localStorage.getItem('ark_users');
            let users = storedUsers ? JSON.parse(storedUsers) : [];
            
            // If users is not an array, initialize it
            if (!Array.isArray(users)) {
                console.warn('Users in localStorage is not an array, initializing empty array');
                users = [];
                localStorage.setItem('ark_users', JSON.stringify(users));
            }
            
            console.log('Retrieved users from localStorage:', users.length);
            return users;
        } catch (error) {
            console.error('Error getting users from localStorage:', error);
            return [];
        }
    },

    // Save users to localStorage
    saveUsers: function(users) {
        try {
            localStorage.setItem('ark_users', JSON.stringify(users));
            console.log('Saved users to localStorage:', users.length);
            return true;
        } catch (error) {
            console.error('Error saving users to localStorage:', error);
            this.showNotification('Error saving user data', 'error');
            return false;
        }
    },

    // Validate email format
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Debug localStorage state before initialization
    console.log('DOMContentLoaded: Checking localStorage state');
    try {
        const users = JSON.parse(localStorage.getItem('ark_users') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('ark_user') || 'null');
        console.log('Users in storage:', users.length);
        console.log('Current user in storage:', currentUser ? currentUser.email : 'none');
    } catch (error) {
        console.error('Error reading initial localStorage state:', error);
    }
    
    // Debug the existence of the signup form
    const signupForm = document.getElementById('signup');
    if (signupForm) {
        console.log('DOMContentLoaded: Signup form found with ID:', signupForm.id);
        // Explicitly add the event listener for the signup form
        signupForm.addEventListener('submit', function(e) {
            console.log('Signup form submitted via direct listener');
            ARKRealestate.handleSignup(e);
        });
    } else {
        console.warn('DOMContentLoaded: No signup form found on this page');
    }
    
    // Debug the existence of the login form
    const loginForm = document.getElementById('login');
    if (loginForm) {
        console.log('DOMContentLoaded: Login form found with ID:', loginForm.id);
        // Explicitly add the event listener for the login form
        loginForm.addEventListener('submit', function(e) {
            console.log('Login form submitted via direct listener');
            ARKRealestate.handleLogin(e);
        });
    } else {
        console.warn('DOMContentLoaded: No login form found on this page');
    }
    
    // Initialize the application
    ARKRealestate.init();
}); 