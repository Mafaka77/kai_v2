const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function run() {
  console.log('Synchronizing User table schema...');
  // This will alter the table to add missing columns (role, office_id, district_id)
  await User.sync({ alter: true });
  
  console.log('Seeding accounts...');
  
  try {
    const adminPassword = await bcrypt.hash('password', 10);
    const managerPassword = await bcrypt.hash('password', 10);

    // Upsert Admin
    await User.upsert({
      id: 1,
      full_name: 'admin',
      mobile: '0000000001',
      password: adminPassword,
      role: 'Admin'
    });
    console.log('Admin account seeded (mobile: 0000000001, password: password, role: Admin)');

    // Upsert Manager
    await User.upsert({
      id: 2,
      full_name: 'manager',
      mobile: '0000000002',
      password: managerPassword,
      role: 'Manager'
    });
    console.log('Manager account seeded (mobile: 0000000002, password: password, role: Manager)');

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding accounts:', error);
  } finally {
    process.exit();
  }
}

run();
