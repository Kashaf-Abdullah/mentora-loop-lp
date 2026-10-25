# Mentora Loop

## Run the site and registration API

The registration form posts to `/api/registrations`. The Node server stores each submission in the MongoDB collection `LP_users`, with `createdAt` and `updatedAt` timestamps.

1. Install Node.js, then run `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to the MongoDB connection string and `MONGODB_DB` to the intended database name. The example database name is `mentora_loop`; change it if you want to use another database.
3. Start the app with `npm start`, then open `http://localhost:3000`.

Keep `.env` private and never commit it. For hosting, deploy this project on a Node.js-capable service, configure `MONGODB_URI`, `MONGODB_DB`, and optionally `PORT` as environment variables, and make sure the MongoDB cluster permits connections from that host.
