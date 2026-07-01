<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6e15e3f7-4927-48d2-8d4f-36e58dddb659

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env` (copying `.env.example` as a template) to your Gemini API key.
3. Run the app:
   `npm run dev`

## 🔒 Secrets & Environment Variables Management
To ensure maximum security and prevent key exposure:
1. **Never commit `.env` files**: `.env` is automatically added to `.gitignore` and must not be checked into Git.
2. **Cloud Deployments (Vercel / Render / GCP)**: Do not deploy with a `.env` file. Instead, use the platform's native environment variables configurations. These hosting platforms store secrets encrypted at rest and inject them securely into the execution environment.
3. **Decryption at Rest**: When running in corporate on-premise environments, prefer loading keys from secret vaults (like GCP Secret Manager or AWS Secrets Manager) instead of text-based environment files.
