const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'Welcome123!';
  const saltRounds = 10;
  
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('Password:', password);
  console.log('Bcrypt hash:', hash);
  console.log('\nYou can use this hash in the SQL query to set the password directly.');
}

generateHash();