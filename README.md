# Party Sync

## Getting Started

This guide will help you set up your development environment for Party Sync.

### Clone the Repository

```bash
git clone https://github.com/smanzler/party-sync.git
cd party-sync
```

### Node Installation

1. Install Node.js from [nodejs.org](https://nodejs.org/en)
2. Verify installation by running:

   ```bash
   node -v
   npm -v
   ```

   You should see version numbers in your terminal. If not, restart your terminal.

3. Install project dependencies:
   ```bash
   npm install
   ```
   This will install all required packages, including TypeScript and other dev dependencies.

### Expo Setup

1. **Device Setup**:

   - Mac users: Install iOS simulator
   - Physical devices: Install the dev build from EAS ([download link](https://expo.dev/accounts/sigh10/projects/party-sync/builds/32d53f73-f865-43fb-9173-5ce4fd525742))

2. Start the development server in dev client mode:
   ```bash
   npx expo start --dev-client
   ```

**Note**: When using a physical device with the dev build, you'll need to:

- Ensure your device is on the same network as your development machine
- Connect to your computer's development server through the app

Changes will automatically reflect in the app when you save.

### Supabase Setup

Supabase serves as our backend service. The `supabase` folder contains:

- Migrations
- Development settings (`config.toml`)
- Seed data for testing

**Prerequisites**:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Start Supabase locally:
   ```bash
   npx supabase start
   ```

On first run, Docker will download required images. You'll then see connection details like:

```
Started supabase local development setup.

API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
[Additional URLs and keys...]
```

**Final Setup**:

1. Copy `.env.example` to `.env.development`
2. Update your environment variables:

   ```
   # Required Environment Variables
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321                  # Your local Supabase URL
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key        # Your local publishable key
   ```

   These values can be found in the console output after running `npx supabase start`.

   - For local development, use the URL and key shown in the terminal

**Using Supabase from a Physical Device**:

When testing on a physical device, you'll need to use ngrok to expose your local Supabase instance:

1. Install ngrok from [ngrok.com](https://ngrok.com/)
2. Start ngrok to tunnel to your local Supabase:
   ```bash
   ngrok http 54321
   ```
3. Copy the HTTPS URL provided by ngrok (e.g., `https://abc123.ngrok.io`)
4. Update your `.env.development` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://abc123.ngrok.io
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

**Note**: The ngrok URL will change each time you restart ngrok (unless you have a paid plan). Remember to update your environment variables accordingly.

And that's it!
