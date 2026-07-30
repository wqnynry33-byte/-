require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npm run make-admin -- you@email.com');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(uri);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.error(`User not found: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`✓ ${user.email} is now admin (role=${user.role})`);
  await mongoose.disconnect();
}

makeAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
