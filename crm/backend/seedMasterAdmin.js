// Script to create master admin and backup admin
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm';

async function seed() {
  await mongoose.connect(MONGO_URI);
  await User.create([
    {
      name: 'Master Admin',
      email: 'Karanap86@gmail.com',
      password: 'REPLACE_WITH_HASH',
      department: 'Admin',
      role: 'master_admin',
      isAI: false
    },
    {
      name: 'Backup Admin',
      email: 'backupadmin@example.com',
      password: 'REPLACE_WITH_HASH',
      department: 'Admin',
      role: 'backup_master_admin',
      isAI: false
    },
    {
      name: 'AI Master Admin',
      email: 'ai-master-admin@system.local',
      password: 'AI_MANAGED',
      department: 'Admin',
      role: 'ai_master_admin',
      isAI: true
    }
  ]);
  console.log('Seeded master admins');
  process.exit();
}
seed();
