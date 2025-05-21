# Git Workflow: Updating Your GitHub Repository

Once your initial MERN boilerplate is on GitHub, you'll want to regularly update your repository with the changes and new features you develop. This guide outlines the standard Git workflow for doing so.

## Standard Git Workflow for Updates:

After you've made changes to your code locally (e.g., added a new feature, fixed a bug, refactored code), follow these steps to update your GitHub repository:

**Navigate to your main project directory:**
Open your terminal (zsh) and ensure you are in the root directory of your project (e.g., my-mern-app), which contains both your backend and frontend folders.

cd path/to/my-mern-app

**Check the status of your changes (Optional but Recommended):**
This command shows you which files have been modified, added, or deleted since your last commit. It helps you confirm what you're about to stage.

git status

**Stage your changes:**
You need to tell Git which specific changes you want to include in your next commit.

To stage all changes (new, modified, deleted files):

git add .

To stage specific files or folders:
(Replace path/to/your/file.js or path/to/your/folder/ with the actual paths)

git add path/to/your/file.js
git add path/to/your/folder/

Tip: It's often good practice to commit related changes together.

**Commit your staged changes:**
This creates a snapshot of your staged changes in your local Git history. Always provide a clear and concise commit message that describes what changes you made.

git commit -m "Descriptive message about your changes (e.g., Add product creation API, Implement user dashboard UI)"

**Good commit message examples:**

feat: Add user profile editing functionality

fix: Resolve login redirection bug

refactor: Improve database connection handling

docs: Update README with setup instructions

**Push your committed changes to GitHub:**
This uploads your local commits to your remote repository on GitHub, making your changes visible there.

git push origin main

origin refers to the remote repository you linked your local project to (GitHub).

main refers to the branch you are pushing to (your primary branch).

**Example Workflow Summary (after making changes):**

cd path/to/my-mern-app
git status # (Optional) See what's changed
git add . # Stage all changes
git commit -m "feat: Add new product feature"
git push origin main

By following these steps, you'll keep your GitHub repository synchronized with your local development, providing a clear history of your project's evolution.
