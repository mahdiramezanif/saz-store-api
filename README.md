# SAZ Store — Express API

The backend for [SAZ Store](https://github.com/mahdiramezanif/saz): an **Express 5** REST API using **MongoDB/Mongoose** for products, customer profiles, and purchases.

> **Demo/learning project:** Login and payment code require security and integration work before real-world use.

## Implemented endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/` | List products |
| `POST` | `/api/register` | Register a customer |
| `POST` | `/api/login` | Find a customer by username (not secure authentication) |
| `POST` | `/api/checkout` | Attempt to start a payment |
| `GET` | `/api/verify` | Attempt payment verification and purchase recording |

The routes are defined in [`src/routes/products.js`](src/routes/products.js).

## Tech stack
Node.js, Express, Mongoose, MongoDB, dotenv, CORS.

## Run locally

**Requirements:** Node.js, npm, and access to a MongoDB instance.

```bash
git clone https://github.com/mahdiramezanif/sazback.git
cd sazback
npm install
```

Create an **untracked** `.env` file:

```dotenv
DATABASE_URL=mongodb://127.0.0.1:27017/saz
PORT=5000
```

Start the API:

```bash
npm start
```

Base URL: `http://localhost:5000/api`.

## Important limitations and next steps
- The login route currently checks only the username and can return the customer record. Add password hashing and session/token-based authentication before handling real users.
- The payment routes call `axios`, but the current code does not import it and the package is absent from `package.json`. Install/import it before testing payment requests.
- Payment merchant ID is a placeholder; callbacks use a hard-coded `localhost` address, and client-provided prices are trusted. Move configuration to environment variables and calculate totals on the server.
- Avoid logging, committing, or exposing customer data or credentials.
- `mongoose.connect()` includes connection options that should be reviewed for the current Mongoose version.

## Frontend
[SAZ Store frontend](https://github.com/mahdiramezanif/saz).
