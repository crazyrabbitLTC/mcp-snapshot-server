# MCP Snapshot Server

A Model Context Protocol server for interacting with Snapshot.org. This server provides MCP-compliant tools for querying Snapshot spaces, proposals, and users.

## Installation

```bash
npm install mcp-snapshot-server
```

## Usage

```typescript
import { MCPServer } from 'mcp-snapshot-server';

const server = new MCPServer();
await server.start();
```

## Available Tools

### getSpaces
Get a list of Snapshot spaces
- `limit`: Number of spaces to fetch (optional)
- `skip`: Number of spaces to skip (optional)

### getRankedSpaces
Get a ranked list of Snapshot spaces with detailed information
- `first`: Number of spaces to fetch (default: 18)
- `skip`: Number of spaces to skip (default: 0)
- `category`: Category to filter by (default: 'all')
- `search`: Search term to filter spaces (optional)

### getProposals
Get proposals for a specific space
- `spaceId`: ID of the space
- `state`: Filter by proposal state (active, closed, pending, all)
- `limit`: Number of proposals to fetch

### getProposal
Get details of a specific proposal
- `proposalId`: ID of the proposal

### getUser
Get information about a Snapshot user
- `address`: Ethereum address of the user

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