
# CS498AppTesting
Repo for testing our CS498 application
=======
# Spotify Search Frontend

A simple `Next.js` frontend that searches the Spotify API for songs and artists.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment file and add your Spotify app credentials:
   ```bash
   cp .env.example .env.local
   ```
3. Add values for:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. Start the app:
   ```bash
   npm run dev
   ```

## Spotify credentials

Create an app at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) to get your client ID and client secret.

