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
   - Other users: Install Expo Go from your device's app store

2. Start the development server:
   ```bash
   npx expo start
   ```

**Note**: When using Expo Go, you'll need to:

- Enable network visibility (app will prompt for permissions)
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

And that's it!
