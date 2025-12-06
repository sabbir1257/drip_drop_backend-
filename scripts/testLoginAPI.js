// Use Node's built-in fetch (Node 18+) or require axios
let fetch;
try {
  // Try to use built-in fetch (Node 18+)
  fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
  console.error('❌ Please install node-fetch: npm install node-fetch');
  process.exit(1);
}

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@dripdrop.com',
        password: 'admin123'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('\nToken:', data.token);
      console.log('User Role:', data.user?.role);
      console.log('User Email:', data.user?.email);
    } else {
      console.error('❌ Login failed!');
      console.error('Status:', response.status);
      console.error('Message:', data.message || data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('Is the server running? Start with: npm run dev');
    process.exit(1);
  }
};

// Check if server is running first
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(() => {
    console.log('✅ Server is running\n');
    return testLogin();
  })
  .catch(() => {
    console.error('❌ Server is not running on port 5000');
    console.error('Please start the server with: npm run dev');
    process.exit(1);
  });

