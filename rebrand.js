const fs = require('fs');
const path = require('path');

// List of main files to process
const mainFilesToProcess = [
  'index.html',
  'about.html',
  'blog.html',
  'contact.html',
  'listing.html',
  'listing-details.html',
  'listing-list.html',
  'listing-right-sidebar.html',
  'login.html',
  'sign-up.html',
  'project.html',
  'project-details.html',
  'services-details.html',
  '404.html'
];

// List of admin files to process
const adminFilesToProcess = [
  'admin/dashboard.html',
  'admin/create-listing.html',
  'admin/chat.html',
  'admin/my-favorites.html',
  'admin/my-properties.html',
  'admin/my-package.html',
  'admin/profile.html',
  'admin/reviews.html',
  'admin/saved-search.html',
  'admin/settings.html',
  'admin/dashboard-dark.html',
  'admin/create-listing-dark.html',
  'admin/chat-dark.html',
  'admin/my-favorites-dark.html',
  'admin/my-properties-dark.html',
  'admin/my-package-dark.html',
  'admin/profile-dark.html',
  'admin/reviews-dark.html',
  'admin/saved-search-dark.html',
  'admin/settings-dark.html'
];

// Define replacements
const replacements = [
  { from: 'NewVilla', to: 'ARK Realestate' },
  { from: 'Morden Bootstrap HTML5 Template', to: 'ARK Realestate - Find Your Dream Property' },
  { from: 'Real Estate HTML Template', to: 'Your Dream Property Awaits' },
  { from: 'Welcome to Realtor', to: 'Welcome to ARK Realestate' },
  { from: 'Listing', to: 'Properties' },
  { from: 'Add Listing', to: 'Add Property' },
  { from: 'Creat Listing', to: 'Create Listing' },
  { from: 'News', to: 'Blog' }
];

// Process a single file
function processFile(filePath) {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping.`);
    return;
  }

  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply replacements
    replacements.forEach(({ from, to }) => {
      const regex = new RegExp(from, 'g');
      content = content.replace(regex, to);
    });
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully processed ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process all files
console.log('Processing main files...');
mainFilesToProcess.forEach(file => {
  processFile(path.join(__dirname, file));
});

console.log('\nProcessing admin files...');
adminFilesToProcess.forEach(file => {
  processFile(path.join(__dirname, file));
});

console.log('\nRebranding complete!'); 