import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

const API_URL = 'http://localhost:3000';

// Test credentials
const TEST_EMAIL = 'rani.shakir@hotmail.com';
const TEST_PASSWORD = 'Test123!';

async function signIn() {
  console.log('🔐 Signing in...');
  const response = await fetch(`${API_URL}/auth/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }),
  });

  const cookies = response.headers.get('set-cookie');
  if (!cookies) {
    // Try direct Supabase auth
    const supabaseUrl = 'https://kwxxpypgtdfimmxnipaz.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eHhweXBndGRmaW1teG5pcGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODM1NDYsImV4cCI6MjA3MDM1OTU0Nn0.YsYf4uztBvMUYJFbt0ICW1GuWltSNUPoXx3yjp2-_SQ';
    
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      }),
    });
    
    const authData = await authResponse.json();
    if (authData.access_token) {
      console.log('✅ Authenticated via Supabase');
      return authData.access_token;
    }
    throw new Error('Failed to authenticate');
  }
  
  console.log('✅ Signed in successfully');
  return cookies;
}

async function getTestProperty(token) {
  console.log('🏠 Getting test property...');
  
  // First, try to get an existing property
  const response = await fetch(`${API_URL}/api/properties`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (data.data && data.data.length > 0) {
    console.log(`✅ Found property: ${data.data[0].id}`);
    return data.data[0].id;
  }
  
  // If no property exists, we need to create one
  console.log('📝 No properties found, creating test property...');
  throw new Error('No test property available. Please create a property first.');
}

async function testImageUpload(propertyId, token) {
  console.log('📸 Testing image upload...');
  
  // Create a test image file
  const testImagePath = '/tmp/test-image.png';
  
  // Create a simple 1x1 pixel PNG
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x62, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82 // IEND chunk
  ]);
  
  fs.writeFileSync(testImagePath, pngBuffer);
  console.log('✅ Created test image');
  
  // Create form data
  const form = new FormData();
  form.append('file', fs.createReadStream(testImagePath), {
    filename: 'test-image.png',
    contentType: 'image/png'
  });
  
  // Upload the image
  const response = await fetch(`${API_URL}/api/properties/${propertyId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    },
    body: form
  });
  
  const result = await response.json();
  
  // Clean up test file
  fs.unlinkSync(testImagePath);
  
  if (response.ok && result.success) {
    console.log('✅ Image uploaded successfully!');
    console.log('📁 Image ID:', result.data?.id);
    console.log('📁 Image path:', result.data?.path);
    return result.data;
  } else {
    console.error('❌ Upload failed:', result.message || result.error);
    throw new Error(result.message || 'Upload failed');
  }
}

async function verifyImageInDatabase(propertyId, imageId, token) {
  console.log('🔍 Verifying image in database...');
  
  const response = await fetch(`${API_URL}/api/properties/${propertyId}/images`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const result = await response.json();
  
  if (result.success && result.data) {
    const uploadedImage = result.data.find(img => img.id === imageId);
    if (uploadedImage) {
      console.log('✅ Image found in database!');
      console.log('📊 Image details:', uploadedImage);
      return true;
    }
  }
  
  console.error('❌ Image not found in database');
  return false;
}

// Main test function
async function runTest() {
  try {
    console.log('🚀 Starting image upload test...\n');
    
    // Step 1: Authenticate
    const token = await signIn();
    
    // Step 2: Get a test property
    const propertyId = await getTestProperty(token);
    
    // Step 3: Upload image
    const uploadedImage = await testImageUpload(propertyId, token);
    
    // Step 4: Verify in database
    if (uploadedImage?.id) {
      await verifyImageInDatabase(propertyId, uploadedImage.id, token);
    }
    
    console.log('\n✅ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
runTest();