const mongoose = require('mongoose');

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

const Registration = mongoose.models.LPUser || mongoose.model('LPUser', registrationSchema);

function validateRegistration(body) {
  const {
    role,
    fullName,
    phoneNumber,
    email,
    occupation,
    skillsToLearn = '',
    skillsToTeach = '',
  } = body || {};

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
    return null;
  }

  return {
    role,
    fullName: fullName.trim(),
    phoneNumber: phoneNumber.trim(),
    email: email.trim(),
    occupation: occupation.trim(),
    skillsToLearn: skillsToLearn.trim(),
    skillsToTeach: skillsToTeach.trim(),
  };
}

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri || !dbName) {
    throw new Error('MONGODB_URI and MONGODB_DB environment variables are required.');
  }

  if (mongoose.connection.readyState === 1) return;

  if (!globalThis.mentoraMongoConnection) {
    globalThis.mentoraMongoConnection = mongoose.connect(uri, { dbName }).catch(error => {
      globalThis.mentoraMongoConnection = null;
      throw error;
    });
  }
  await globalThis.mentoraMongoConnection;
}

async function saveRegistration(registration) {
  await Registration.create(registration);
}

module.exports = { connectToDatabase, saveRegistration, validateRegistration };
