# NDK Blossom Upload Example

This is a simple React application that demonstrates how to use the NDK Blossom package for file uploads in Nostr applications.

## Features

- Login via a NIP-07 signer (browser extension like nos2x or Alby)
- Login with a private key
- Generate a new private key
- View the list of Blossom servers for the logged-in user
- Upload files to Blossom servers
- Track upload progress
- View the uploaded file URL

## Prerequisites

- Node.js (v16 or higher)
- Bun package manager
- A Nostr browser extension (for NIP-07 login)
- Blossom servers configured in your Nostr profile

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Start the development server:

```bash
bun run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. Login using one of the available methods:
   - NIP-07 browser extension
   - Private key
   - Generate a new key

2. Once logged in, you'll see your profile information and the list of Blossom servers associated with your account.

3. If you don't have any Blossom servers configured, you'll need to add them to your profile first.

4. To upload a file:
   - Click "Select File" to choose a file from your filesystem
   - Click "Upload File" to start the upload process
   - The progress bar will show the upload progress
   - Once complete, the file URL will be displayed

## Notes

- This example uses the local version of the blossom package from the parent directory
- The uploaded files are stored on the Blossom servers associated with your Nostr account
- A Nostr event (kind 1) is published with the uploaded file metadata when the upload is successful