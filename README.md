# MCP Snapshot Server

A Model Context Protocol server for interacting with Snapshot.org. This server provides MCP-compliant tools, resources, and prompts for querying Snapshot spaces, proposals, and users.

## Installation

```bash
npm install mcp-snapshot-server
```

## Usage with Claude Desktop

1. Install the server globally:
```bash
npm install -g mcp-snapshot-server
```

2. Start the server:
```bash
snapshot-mcp-server
```

3. In Claude Desktop settings:
   - Go to Settings > Model Context Protocol
   - Add a new server with:
     - Name: "Snapshot"
     - Command: "snapshot-mcp-server"
     - Working Directory: (leave blank)

4. The server will now be available in your Claude conversations

## Available Functionality

### Tools

#### getSpaces
Get a list of Snapshot spaces
- `limit`: Number of spaces to fetch (optional)
- `skip`: Number of spaces to skip (optional)

#### getRankedSpaces
Get a ranked list of Snapshot spaces with detailed information
- `first`: Number of spaces to fetch (default: 18)
- `skip`: Number of spaces to skip (default: 0)
- `category`: Category to filter by (default: 'all')
- `search`: Search term to filter spaces (optional)

#### getProposals
Get proposals for a specific space
- `spaceId`: ID of the space
- `state`: Filter by proposal state (active, closed, pending, all)
- `limit`: Number of proposals to fetch

#### getProposal
Get details of a specific proposal
- `proposalId`: ID of the proposal

#### getUser
Get information about a Snapshot user
- `address`: Ethereum address of the user

### Resources

Available at these URIs:
- `snapshot://spaces` - List of all Snapshot spaces
- `snapshot://proposals/{spaceId}` - Proposals for a specific space
- `snapshot://users/{address}` - Information about a specific user

### Prompts

#### summarizeProposal
Generates a prompt to summarize a Snapshot proposal
- Required argument: `proposalId`

#### listActiveProposals
Generates a prompt to list active proposals for a space
- Required argument: `spaceName`

#### generateTweet
Generates a prompt for a tweet about voting on a proposal
- Required argument: `proposalName`

## Development

1. Clone the repository:
```bash
git clone https://github.com/crazyrabbitLTC/mcp-snapshot-server.git
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

## License

MIT © [Dennison Bertram](mailto:dennison@tally.xyz)