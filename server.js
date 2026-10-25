require('dotenv').config();

const path = require('node:path');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = Number(process.env.PORT) || 3000;

const registrationSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['Student / Learner', 'Teacher / Mentor'],
  },
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  phoneNumber: { type: String, required: true, trim: true, maxlength: 40 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  occupation: { type: String, required: true, trim: true, maxlength: 120 },
  skillsToLearn: { type: String, trim: true, maxlength: 2000, default: '' },
  skillsToTeach: { type: String, trim: true, maxlength: 2000, default: '' },
}, {
  collection: 'LP_users',
  timestamps: true,
  versionKey: false,
});

const Registration = mongoose.model('LPUser', registrationSchema);

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.post('/api/registrations', async (req, res) => {
  const {
    role,
    fullName,
    phoneNumber,
    email,
    occupation,
    skillsToLearn = '',
    skillsToTeach = '',
  } = req.body || {};

  const allowedRoles = ['Student / Learner', 'Teacher / Mentor'];
  const values = [fullName, phoneNumber, email, occupation];
  if (!allowedRoles.includes(role)
    || values.some(value => typeof value !== 'string' || !value.trim())
    || typeof skillsToLearn !== 'string'
    || typeof skillsToTeach !== 'string'
    || fullName.length > 120
    || phoneNumber.length > 40
    || email.length > 254
    || occupation.length > 120
    || skillsToLearn.length > 2000
    || skillsToTeach.length > 2000
    || (role === 'Student / Learner' && !skillsToLearn.trim())
    || (role === 'Teacher / Mentor' && !skillsToTeach.trim())
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide valid registration details.' });
  }

  try {
    await Registration.create({
      role,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      occupation: occupation.trim(),
      skillsToLearn: skillsToLearn.trim(),
      skillsToTeach: skillsToTeach.trim(),
    });
    return res.status(201).json({ message: 'Registration saved.' });
  } catch (error) {
    console.error('Could not save registration:', error);
    return res.status(500).json({ error: 'Registration could not be saved. Please try again.' });
  }
});

app.use((error, req, res, next) => {
  if (req.path.startsWith('/api/') && error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }
  if (req.path.startsWith('/api/') && error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  return next(error);
});

app.use(express.static(path.join(__dirname)));

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Set it in the deployment environment or .env file.');
  }
  if (!process.env.MONGODB_DB) {
    throw new Error('MONGODB_DB is required. Set the target database name in the environment or .env file.');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB,
  });
  console.log(`Connected to MongoDB database "${process.env.MONGODB_DB}".`);

  app.listen(port, () => {
    console.log(`Mentora Loop is running on port ${port}.`);
  });
}

start().catch(error => {
  console.error('Server startup failed:', error);
  process.exitCode = 1;
});
