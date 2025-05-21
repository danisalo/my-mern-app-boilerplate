# Environment Variables (.env) Guide

Environment variables are crucial for configuring your application based on different environments (development, production, testing) and for securely storing sensitive information. This guide explains how to set up and use `.env` files in your MERN boilerplate.

**Remember:** `.env` files should **NEVER** be committed to version control (like GitHub) as they contain sensitive data. The provided `.gitignore` file already includes rules to prevent this.

## How to Create and Use .env Files

After duplicating the repository and before running your application, you will need to create `.env` files in both your `backend` and `frontend` subdirectories.

### 1. Backend (`backend/.env`)

The backend `.env` file stores sensitive information and configuration specific to your server.

**Content Example:**
`PORT=3001`
`MONGODB_URI=mongodb://localhost:27017/create-boilerplate`
`JWT_SECRET=your_jwt_secret_key_here`

**Important Notes for Backend:**

- **Security:** Never expose `MONGODB_URI` or `JWT_SECRET` in your client-side code or public repositories.
- **Loading:** The `dotenv` package (already installed in your backend) automatically loads these variables into `process.env` when your Node.js server starts.

### 2. Frontend (`frontend/.env`)

The frontend `.env` file stores configuration variables that your React application needs.

**Content Example:**
`REACT_APP_API_BASE_URL=http://localhost:3001/api`

**Important Notes for Frontend:**

- **Prefixing:** For Create React App (which this boilerplate uses), all environment variables used in the frontend **must be prefixed with `REACT_APP_`**. Variables without this prefix will be ignored.
- **Public Exposure:** Variables in the frontend `.env` (even if named `.env.production`, etc.) are embedded into the client-side JavaScript bundle during the build process. This means they are **publicly accessible** in the user's browser.
- **Never Store Secrets:** Due to their public nature, **never store sensitive API keys or secrets** (like your `JWT_SECRET` or full database credentials) in frontend `.env` files. These should only reside on your backend.

---

By following these guidelines, you'll ensure your application is configured correctly for different environments while maintaining the security of your sensitive credentials.
