const fs = require('fs');
const path = require('path');

// List of admin files to update
const adminFilesToUpdate = [
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

// Script tags to insert
const scriptsToInsert = `
    <!-- ARK Realestate JS Files -->
    <script src="../assets/js/config.js"></script>
    <script src="../assets/js/ark-app.js"></script>
`;

console.log('Starting admin script insertion process...');

// Process each file
adminFilesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  console.log(`Processing ${filePath}...`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File ${file} does not exist, skipping.`);
    return;
  }

  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Read ${content.length} characters from ${file}`);
    
    // Find the script.js line (admin pages might reference admin assets folder)
    const scriptJsRegex = /<script src="(\.\.\/)?assets\/js\/script\.js"><\/script>/;
    
    if (scriptJsRegex.test(content)) {
      console.log(`Found script.js in ${file}`);
      // Insert our scripts after script.js
      content = content.replace(
        scriptJsRegex,
        match => `${match}${scriptsToInsert}`
      );
      
      // Write back to file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Successfully updated ${file}`);
    } else {
      console.log(`Could not find script.js in ${file}, trying to insert before </body>`);
      
      // Try to insert before </body>
      const bodyEndRegex = /<\/body>/;
      
      if (bodyEndRegex.test(content)) {
        console.log(`Found </body> in ${file}`);
        content = content.replace(
          bodyEndRegex,
          `${scriptsToInsert}</body>`
        );
        
        // Write back to file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully updated ${file} (inserted before </body>)`);
      } else {
        console.log(`Could not update ${file} - neither script.js nor </body> was found`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

console.log('Admin script insertion complete!'); 