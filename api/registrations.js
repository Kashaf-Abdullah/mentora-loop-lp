const {
  connectToDatabase,
  saveRegistration,
  validateRegistration,
} = require('../lib/registrations');

module.exports = async function registrations(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const registration = validateRegistration(req.body);
  if (!registration) {
    return res.status(400).json({ error: 'Please provide valid registration details.' });
  }

  try {
    await connectToDatabase();
    await saveRegistration(registration);
    return res.status(201).json({ message: 'Registration saved.' });
  } catch (error) {
    console.error('Could not save registration:', error);
    return res.status(500).json({ error: 'Registration could not be saved. Please try again.' });
  }
};
