# MERN App Order of Operations

This guide outlines the recommended sequence for setting up your MERN boilerplate, integrating instructions from the "MERN App Environment Setup Guide" and the GitHub upload guide. This boilerplate provides a foundational structure for your application, and you are encouraged to customize and expand upon it as needed.

## Recommended Order of Operations:

1.  **Duplicate the Boilerplate Project:**

    - Start by duplicating the entire boilerplate project folder (e.g., `my-mern-app`) to a new location on your system. This ensures you have a clean starting point for your custom application, allowing you to freely modify all aspects.
    - Inside your duplicated `create-boilerplate` folder, you will find two subdirectories: `backend` and `frontend`. These already contain all the provided code files.

2.  **Set up Necessary Environments (Refer to "MERN App Environment Setup Guide" Canvas):**

    - **Node.js and npm (Prerequisite):**

      - **Action:** Verify Node.js and npm are installed and accessible on your system.
      - **Command:** In your terminal (zsh), run:
        ```bash
        node -v
        npm -v
        ```
      - **Reference:** See Section III of the "MERN App Environment Setup Guide" Canvas. If not installed, follow the installation steps there.

    - **Install Backend Dependencies:**

      - **Action:** Install all server-side libraries.
      - **Command:** Navigate into your `backend` directory and run:
        ```bash
        npm install
        ```

    - **MongoDB Database Setup:**

      - **Action:** Set up your MongoDB database.
      - **Reference:** Follow either **Option A (Local MongoDB)** or **Option B (MongoDB Atlas)** from Section I of the "MERN App Environment Setup Guide" Canvas. This is crucial for your backend to connect to a database.

    - **JWT Secret Generation:**

      - **Action:** Generate a strong JWT secret.
      - **Reference:** Follow Section II of the "MERN App Environment Setup Guide" Canvas.

    - **Configure Backend `.env`:**

      - **Action:** Update your backend environment variables.
      - **Details:** Ensure your `backend/.env` file has the correct `MONGODB_URI` (from your MongoDB setup) and `JWT_SECRET` (from your JWT secret generation).

    - **Start Backend Server:**
      - **Action:** Launch your backend server.
      - **Command:** In your `backend` directory, run:
        ```bash
        npm run dev
        ```

3.  **Set up the Frontend:**

    - **Install Frontend Dependencies:**

      - **Action:** Install all client-side libraries.
      - **Command:** In a _separate_ terminal window, navigate into your `frontend` directory and run:
        ```bash
        npm install
        ```

    - **Start Frontend Development Server:**
      - **Action:** Compile and launch your React application.
      - **Command:** In your `frontend` directory, run:
        ```bash
        npm start
        ```

4.  **Initialize and Upload to GitHub (Refer to "MERN Boilerplate GitHub Upload Instructions" guide):**

    - **Initialize Git Repository:**

      - **Action:** Start Git version control for your project.
      - **Command:** Navigate back to your _main project directory_ (`my-mern-app`) and run:
        ```bash
        git init
        ```

    - **Create `.gitignore`:**

      - **Action:** Create the `.gitignore` file in your main project directory and add the specified content (to prevent `node_modules`, `.env`, etc., from being committed).

    - **Add and Commit:**

      - **Action:** Stage all relevant files and save your initial project state.
      - **Command:** Run `git add .` followed by:
        ```bash
        git commit -m "Initial MERN boilerplate setup with auth and Tailwind"
        ```

    - **Create GitHub Repository:**

      - **Action:** Create a new, empty repository on GitHub.
      - **Details:** Go to <https://github.com/> and follow the steps to create a new repository (do NOT initialize with a README, .gitignore, or license).

    - **Link and Push:**
      - **Action:** Connect your local repository to GitHub and upload your code.
      - **Command:** Copy the commands provided by GitHub after creating your repository (e.g., `git remote add origin ...`, `git branch -M main`, `git push -u origin main`) and execute them in your terminal.
