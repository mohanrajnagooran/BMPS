require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { generateCode } = require('../utils/codeGenerator');

const User = require('../models/User');
const Client = require('../models/Client');
const ClientCompany = require('../models/ClientCompany');
const Agent = require('../models/Agent');
const JobDemand = require('../models/JobDemand');
const Candidate = require('../models/Candidate');

async function seed() {
  await connectDB();

  const existingAdmin = await User.findOne({ email: 'admin@bmps.local' });
  if (!existingAdmin) {
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@bmps.local',
      role: 'SuperAdmin',
      department: 'Admin',
      status: 'Active'
    });
    admin.code = await generateCode('USR');
    await admin.setPassword('Admin@12345');
    await admin.save();
    console.log('[seed] Admin user created -> admin@bmps.local / Admin@12345');
  } else {
    console.log('[seed] Admin user already exists, skipping.');
  }

  const clientCount = await Client.countDocuments();
  if (clientCount === 0) {
    const client = await Client.create({
      code: await generateCode('CLI'),
      name: 'Acme Global Pte Ltd (Sample)',
      type: 'Company Representative',
      country: 'Singapore',
      email: 'contact@acmeglobal.example',
      phone: '+65 6123 4567',
      status: 'Active',
      notes: 'Sample seed record — safe to delete.'
    });

    const company = await ClientCompany.create({
      code: await generateCode('CO'),
      name: 'Acme Global Manufacturing Pte Ltd',
      uen: '201900000A',
      client: client._id,
      country: 'Singapore',
      sector: 'Primary',
      status: 'Active'
    });

    const agent = await Agent.create({
      code: await generateCode('AGT'),
      name: 'Sample Sourcing Agency',
      type: 'Main Agent',
      category: 'Company Agent',
      country: 'India',
      locationCategory: 'India-Based',
      status: 'Active'
    });

    const jobDemand = await JobDemand.create({
      code: await generateCode('JD'),
      client: client._id,
      company: company._id,
      country: 'Singapore',
      position: 'Production Operator',
      quantity: 5,
      permitType: 'Work Permit',
      status: 'Open',
      priority: 'Normal'
    });

    await Candidate.create({
      code: await generateCode('CAN'),
      fullName: 'Sample Candidate',
      nationality: 'India',
      gender: 'Male',
      phone: '+91 9000000000',
      source: 'Agent',
      agent: agent._id,
      status: 'New'
    });

    console.log('[seed] Sample Client/Company/Agent/JobDemand/Candidate created.');
  } else {
    console.log('[seed] Sample data already present, skipping.');
  }

  console.log('[seed] Done.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
