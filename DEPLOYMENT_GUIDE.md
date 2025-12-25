# How to Update and Deploy

This project is fully automated for easy updates and deployment using GitHub and Netlify.

## How to Update the Project

1. **Make your code changes** locally on your computer.
2. **Commit your changes** using Git:
   ```
   git add .
   git commit -m "Describe your changes"
   ```
3. **Push your changes to GitHub**:
   ```
   git push
   ```

## How Deployment Works

- Every push to the `master` branch on GitHub automatically triggers a deployment on Netlify.
- No manual deployment steps are needed.
- You can monitor deployment status and logs in your Netlify dashboard.

## Environment Variables

- Set any secrets or API keys in the Netlify dashboard under Site Settings > Environment Variables.
- Do **not** commit `.env` files to GitHub.

## Troubleshooting

- If a deployment fails, check the build logs in Netlify for errors.
- Make sure all dependencies are listed in `package.json`.
- For help, contact your admin or developer.

---

**Quick Summary:**
- Edit code → Commit → Push to GitHub → Netlify auto-deploys.
