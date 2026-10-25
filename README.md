# Mentora Loop

## Run the site and registration API

The registration form posts to `/api/registrations`. The Node server stores each submission in the MongoDB collection `LP_users`, with `createdAt` and `updatedAt` timestamps.

1. Install Node.js, then run `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to the MongoDB connection string and `MONGODB_DB` to the intended database name. The example database name is `mentora_loop`; change it if you want to use another database.
3. Start the app with `npm start`, then open `http://localhost:3000`.

Keep `.env` private and never commit it. ## Deploy on Vercel

1. Push this project to a GitHub repository.
2. In Vercel, select **Add New → Project**, import the repository, and leave the project root as the folder containing `package.json` and `index.html`.
3. In **Project Settings → Environment Variables**, add:
   - `MONGODB_URI`: the MongoDB Atlas connection string. Use the rotated database-user password; URL-encode special characters in it.
   - `MONGODB_DB`: `test` (the database shown in Atlas).
   Add both variables to **Production** (and Preview if needed), then redeploy after changing them.
4. Deploy. Vercel serves the static landing page and the serverless registration endpoint at `/api/registrations`.
5. Open the deployed site, submit one test registration, and verify that a new document appears in Atlas under `test` → `LP_users`.

In MongoDB Atlas, allow network access from the deployed app. For a quick initial test you can use Atlas' all-IP access rule (`0.0.0.0/0`), but restrict access appropriately for production. Do not put database credentials in frontend code, GitHub, or a committed `.env` file.
