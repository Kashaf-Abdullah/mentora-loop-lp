require('dotenv').config();

const path = require('node:path');
const express = require('express');
const {
  connectToDatabase,
  saveRegistration,
  validateRegistration,
} = require('./lib/registrations');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.post('/api/registrations', async (req, res) => {
  const registration = validateRegistration(req.body);
  if (!registration) {
    return res.status(400).json({ error: 'Please provide valid registration details.' });
  }

  try {
    await saveRegistration(registration);
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
  await connectToDatabase();
  console.log(`Connected to MongoDB database "${process.env.MONGODB_DB}".`);

  app.listen(port, () => {
    console.log(`Mentora Loop is running on port ${port}.`);
  });
}

start().catch(error => {
  console.error('Server startup failed:', error);
  process.exitCode = 1;
});
