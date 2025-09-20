# Attio-Airtable Sync

A modern, professional synchronization tool for seamlessly syncing data between Attio CRM and Airtable.

## Features

- 🔄 **Bidirectional Sync**: Support for one-way (Attio to Airtable, Airtable to Attio) and bidirectional synchronization
- 🎯 **Smart Field Mapping**: Visual field mapping interface with automatic type detection
- 🛡️ **Data Safety**: Built-in safety features including deletion prevention and backup options
- 📊 **Real-time Progress**: Live sync status updates and detailed logging
- 🔐 **Secure Authentication**: OAuth-based authentication for both platforms
- 📋 **List Support**: Full support for Attio lists and their parent objects

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Attio account with API access
- Airtable account with API access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/attio-airtable-sync.git
cd attio-airtable-sync
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Add your environment variables here
VITE_APP_NAME=Attio-Airtable Sync
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`

3. Follow the step-by-step wizard:
   - **Step 1**: Connect to Attio and Airtable using your API keys
   - **Step 2**: Select source and destination objects/tables
   - **Step 3**: Map fields between the two platforms
   - **Step 4**: Configure sync settings
   - **Step 5**: Execute the sync

## Configuration Options

### Sync Direction
- **Attio to Airtable**: One-way sync from Attio to Airtable
- **Airtable to Attio**: One-way sync from Airtable to Attio
- **Bidirectional**: Two-way sync (advanced)

### Safety Settings
- **Create New Records**: Enable creation of new records in the destination
- **Update Existing Records**: Enable updating of existing records
- **Prevent Deletions**: Prevent records from being deleted during sync
- **Create Backups**: Export data before syncing

## API Configuration

### Attio API
1. Log in to your Attio account
2. Navigate to Settings > API
3. Create a new API key
4. Copy the API key and paste it in the connection step

### Airtable API
1. Log in to your Airtable account
2. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens)
3. Create a new personal access token with the following scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
4. Copy the token and paste it in the connection step

## Development

### Project Structure
```
attio-airtable-sync/
├── src/
│   ├── components/       # React components
│   ├── services/         # Business logic and API services
│   ├── styles/          # CSS and styling
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── package.json         # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Security Notes

- Never commit API keys or tokens to version control
- Use environment variables for sensitive configuration
- The application stores API keys in browser localStorage (encrypted)
- All API communications use HTTPS

## Troubleshooting

### Common Issues

1. **HTTP 400 Error when fetching from Attio**
   - Ensure you're using the correct filter syntax for entity-reference fields
   - Check that the list ID and parent object type are correctly configured

2. **Records being skipped during sync**
   - Verify that "Create New Records" option is enabled
   - Check field mapping configuration

3. **Cannot connect to Airtable**
   - Ensure your API token has the necessary scopes
   - Verify the base ID is correct

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.