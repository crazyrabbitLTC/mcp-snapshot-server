import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from 'dotenv';
import { SnapshotService } from './services/snapshotService.js';
import { z } from 'zod';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListToolsResultSchema,
  CallToolResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Load environment variables
config();

// Define parameter schemas for tool arguments
const SpacesParamsSchema = z.object({
  limit: z.number().optional(),
  skip: z.number().optional()
});

const ProposalsParamsSchema = z.object({
  spaceId: z.string(),
  state: z.string().optional(),
  limit: z.number().optional()
});

const ProposalParamsSchema = z.object({
  proposalId: z.string()
});

const UserParamsSchema = z.object({
  address: z.string()
});

const RankedSpacesParamsSchema = z.object({
  first: z.number().optional(),
  skip: z.number().optional(),
  category: z.string().optional(),
  search: z.string().optional()
});

export class MCPServer {
  private server: Server;
  private snapshotService: SnapshotService;

  constructor() {
    this.server = new Server({
      name: "snapshot-mcp",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: {
          list: true,  // Declare that we support tools/list
          call: true   // Declare that we support tools/call
        }
      }
    });

    this.snapshotService = new SnapshotService();
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "getSpaces",
            description: "Get list of Snapshot spaces",
            inputSchema: {  // Changed from parameters to inputSchema
              type: "object",
              properties: {
                limit: { type: "number", description: "Number of spaces to fetch" },
                skip: { type: "number", description: "Number of spaces to skip" }
              }
            }
          },
          {
            name: "getProposals",
            description: "Get proposals for a Snapshot space",
            inputSchema: {  // Changed from parameters to inputSchema
              type: "object",
              properties: {
                spaceId: { type: "string", description: "ID of the space" },
                state: { type: "string", description: "Filter by proposal state (active, closed, pending, all)" },
                limit: { type: "number", description: "Number of proposals to fetch" }
              },
              required: ["spaceId"]
            }
          },
          {
            name: "getProposal",
            description: "Get details of a specific proposal",
            inputSchema: {  // Changed from parameters to inputSchema
              type: "object",
              properties: {
                proposalId: { type: "string", description: "ID of the proposal" }
              },
              required: ["proposalId"]
            }
          },
          {
            name: "getUser",
            description: "Get information about a Snapshot user",
            inputSchema: {  // Changed from parameters to inputSchema
              type: "object",
              properties: {
                address: { type: "string", description: "Ethereum address of the user" }
              },
              required: ["address"]
            }
          },
          {
            name: "getRankedSpaces",
            description: "Get ranked list of Snapshot spaces with detailed information",
            inputSchema: {
              type: "object",
              properties: {
                first: { type: "number", description: "Number of spaces to fetch (default: 18)" },
                skip: { type: "number", description: "Number of spaces to skip (default: 0)" },
                category: { type: "string", description: "Category to filter by (default: 'all')" },
                search: { type: "string", description: "Search term to filter spaces" }
              }
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.error('Received tool call request:', JSON.stringify(request, null, 2));
      
      if (!request.params || !request.params.name) {
        throw new Error('Invalid tool call request: missing tool name');
      }

      const toolName = request.params.name;
      const args = request.params.arguments || {};

      try {
        switch (toolName) {
          case "getSpaces": {
            const parsedArgs = SpacesParamsSchema.parse(args);
            const spaces = await this.snapshotService.getSpaces(
              parsedArgs.limit || 20,
              parsedArgs.skip || 0
            );
            return {
              content: [{
                type: "text",
                text: JSON.stringify(spaces, null, 2)
              }]
            };
          }
          case "getProposals": {
            const parsedArgs = ProposalsParamsSchema.parse(args);
            const proposals = await this.snapshotService.getProposals(
              parsedArgs.spaceId,
              parsedArgs.state || "all",
              parsedArgs.limit || 20
            );
            return {
              content: [{
                type: "text",
                text: JSON.stringify(proposals, null, 2)
              }]
            };
          }
          case "getProposal": {
            const parsedArgs = ProposalParamsSchema.parse(args);
            const proposal = await this.snapshotService.getProposal(parsedArgs.proposalId);
            return {
              content: [{
                type: "text",
                text: JSON.stringify(proposal, null, 2)
              }]
            };
          }
          case "getUser": {
            const parsedArgs = UserParamsSchema.parse(args);
            const user = await this.snapshotService.getUser(parsedArgs.address);
            return {
              content: [{
                type: "text",
                text: JSON.stringify(user, null, 2)
              }]
            };
          }
          case "getRankedSpaces": {
            const parsedArgs = RankedSpacesParamsSchema.parse(args);
            const spaces = await this.snapshotService.getRankedSpaces(
              parsedArgs.first || 18,
              parsedArgs.skip || 0,
              parsedArgs.category || "all",
              parsedArgs.search
            );
            return {
              content: [{
                type: "text",
                text: JSON.stringify(spaces, null, 2)
              }]
            };
          }
          default:
            throw new Error(`Tool not found: ${toolName}`);
        }
      } catch (error) {
        console.error("Tool execution error:", error);
        return {
          content: [{ 
            type: "text", 
            text: error instanceof Error ? error.message : 'Unknown error'
          }]
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
} 