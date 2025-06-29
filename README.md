
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a21c8f4b-17f4-4109-947f-35cf548ff4ce

## Security Setup

### Environment Variables

Before running this project, you need to set up your environment variables:

1. Copy `.env.example` to `.env`
2. Fill in your actual Firebase configuration values
3. **Never commit the `.env` file to version control**

For production deployment, set these environment variables in your hosting platform:

```
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_API_BASE_URL=https://your-api-domain.com
VITE_SMS_API_BASE_URL=https://your-sms-api-domain.com
```

### Security Features

This project includes several security enhancements:

- **Rate Limiting**: Prevents brute force attacks on login/registration
- **Password Validation**: Enforces strong password requirements
- **Generic Error Messages**: Prevents information leakage
- **Security Logging**: Monitors authentication events and suspicious activities
- **Environment Variable Protection**: Sensitive credentials are not exposed in code

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a21c8f4b-17f4-4109-947f-35cf548ff4ce) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables (see Security Setup above)

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase (Authentication & Firestore)
- Framer Motion (Animations)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a21c8f4b-17f4-4109-947f-35cf548ff4ce) and click on Share -> Publish.

**Important**: Make sure to set up your environment variables in your deployment platform before publishing.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Security Considerations

1. **Remove sensitive files from Git history** if they were previously committed
2. **Set up environment variables** in your deployment platform
3. **Monitor security logs** for suspicious activities
4. **Keep dependencies updated** regularly
5. **Use HTTPS** in production
6. **Configure Firebase Security Rules** appropriately

