/**
 * Iryotek Firebase User Purge Script
 * 
 * This script batch-deletes all registered and signed-up users from the
 * Iryotek Firebase Authentication project (iryotek-c7b5c).
 * 
 * Usage:
 *   1. Download your service account key from:
 *      https://console.firebase.google.com/project/iryotek-c7b5c/settings/serviceaccounts/adminsdk
 *   2. Save it as `serviceAccountKey.json` in this directory (or set GOOGLE_APPLICATION_CREDENTIALS)
 *   3. Run:
 *      node scripts/delete_firebase_users.js
 */

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('========================================================');
  console.log('       IRYOTEK FIREBASE USER DELETION UTILITY           ');
  console.log('========================================================\n');

  // Check for service account file
  const possiblePaths = [
    path.join(__dirname, 'serviceAccountKey.json'),
    path.join(__dirname, '..', 'serviceAccountKey.json'),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  ].filter(Boolean);

  let keyPath = possiblePaths.find(p => fs.existsSync(p));

  if (!keyPath) {
    console.log('⚠️  No serviceAccountKey.json found.');
    console.log('\nTo delete all users from Firebase via this script:');
    console.log('1. Go to Firebase Console:');
    console.log('   https://console.firebase.google.com/project/iryotek-c7b5c/settings/serviceaccounts/adminsdk');
    console.log('2. Click "Generate new private key"');
    console.log('3. Save the downloaded JSON file as:');
    console.log('   ' + path.join(__dirname, '..', 'serviceAccountKey.json'));
    console.log('4. Re-run: node scripts/delete_firebase_users.js\n');
    console.log('Alternatively, you can delete all users directly in 2 clicks on the web:');
    console.log('   https://console.firebase.google.com/project/iryotek-c7b5c/authentication/users');
    console.log('   (Select all user checkboxes -> Click "Delete account")\n');
    return;
  }

  console.log('Found service account credentials at:', keyPath);
  
  let admin;
  try {
    admin = require('firebase-admin');
  } catch (e) {
    console.log('Installing firebase-admin dependency...');
    require('child_process').execSync('npm install --no-save firebase-admin', { stdio: 'inherit' });
    admin = require('firebase-admin');
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'iryotek-c7b5c'
    });
  }

  const auth = admin.auth();
  console.log('Fetching users from Firebase Authentication (project: iryotek-c7b5c)...');

  let uidsToDelete = [];
  let nextPageToken;

  do {
    const listResult = await auth.listUsers(1000, nextPageToken);
    listResult.users.forEach(userRecord => {
      console.log(`- Found user: ${userRecord.uid} (${userRecord.email || userRecord.phoneNumber || 'anonymous'})`);
      uidsToDelete.push(userRecord.uid);
    });
    nextPageToken = listResult.pageToken;
  } while (nextPageToken);

  if (uidsToDelete.length === 0) {
    console.log('\n✅ No registered users found in Firebase. Project auth is already clean!');
    return;
  }

  console.log(`\nDeleting ${uidsToDelete.length} user(s) from Firebase...`);

  // Batch delete up to 1000 users per call
  for (let i = 0; i < uidsToDelete.length; i += 1000) {
    const chunk = uidsToDelete.slice(i, i + 1000);
    const result = await auth.deleteUsers(chunk);
    console.log(`Successfully deleted ${result.successCount} users.`);
    if (result.failureCount > 0) {
      console.error(`Failed to delete ${result.failureCount} users:`);
      result.errors.forEach(err => console.error(err.error.toJSON()));
    }
  }

  console.log('\n✅ All Firebase users successfully deleted!');
}

main().catch(err => {
  console.error('Fatal error during Firebase user deletion:', err);
  process.exit(1);
});
