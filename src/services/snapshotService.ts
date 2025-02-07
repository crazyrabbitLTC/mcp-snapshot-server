/**
 * @file SnapshotService
 * @version 1.0.0
 * @status STABLE - DO NOT MODIFY WITHOUT TESTS
 * @lastModified 2024-03-20
 * 
 * Service for interacting with Snapshot GraphQL API
 * 
 * IMPORTANT:
 * - Add tests before modifying functionality
 * - Validate GraphQL responses
 * 
 * Functionality:
 * - Query spaces
 * - Query proposals
 * - Query votes
 * - Query users
 */

const SNAPSHOT_API_URL = 'https://hub.snapshot.org/graphql';

interface Space {
  id: string;
  name: string;
  about?: string;
  network?: string;
  symbol?: string;
  strategies?: any[];
  admins?: string[];
  members?: string[];
}

interface Proposal {
  id: string;
  title: string;
  body?: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: string;
  state: string;
  author: string;
  space: {
    id: string;
    name: string;
  };
}

interface User {
  id: string;
  name?: string;
  about?: string;
  avatar?: string;
}

interface RankedSpace {
  id: string;
  verified: boolean;
  turbo: boolean;
  admins: string[];
  members: string[];
  name: string;
  avatar: string;
  cover: string;
  network: string;
  about: string;
  website?: string;
  twitter?: string;
  github?: string;
  coingecko?: string;
  symbol: string;
  activeProposals: number;
  treasuries: {
    name: string;
    network: string;
    address: string;
  }[];
  voting: {
    delay: number;
    period: number;
    type: string;
    quorum: number;
    quorumType: string;
    privacy: string;
    hideAbstain: boolean;
  };
  proposalsCount: number;
  votesCount: number;
  followersCount: number;
  labels: {
    id: string;
    name: string;
    description: string;
    color: string;
  }[];
  delegationPortal: {
    delegationType: string;
    delegationContract: string;
    delegationNetwork: string;
    delegationApi: string;
  };
  strategies: {
    name: string;
    params: any;
    network: string;
  }[];
  validation: {
    name: string;
    params: any;
  };
  filters: {
    minScore: number;
    onlyMembers: boolean;
  };
  proposalsCount1d: number;
  proposalsCount30d: number;
  children: {
    id: string;
    name: string;
    avatar: string;
    cover: string;
    proposalsCount: number;
    votesCount: number;
    activeProposals: number;
    turbo: boolean;
    verified: boolean;
    network: string;
  }[];
  parent: {
    id: string;
    name: string;
    avatar: string;
    cover: string;
    proposalsCount: number;
    votesCount: number;
    activeProposals: number;
    turbo: boolean;
    verified: boolean;
    network: string;
  };
  terms: string;
  private: boolean;
  domain: string;
  skin: string;
  skinSettings: {
    bg_color: string;
    link_color: string;
    text_color: string;
    content_color: string;
    border_color: string;
    heading_color: string;
    primary_color: string;
    theme: string;
  };
  guidelines: string;
  template: string;
  categories: string[];
  moderators: string[];
  plugins: any;
  boost: {
    enabled: boolean;
    bribeEnabled: boolean;
  };
  voteValidation: {
    name: string;
    params: any;
  };
}

export class SnapshotService {
  private async queryGraphQL(query: string, variables?: any) {
    const response = await fetch(SNAPSHOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Snapshot API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data.data;
  }

  async getSpaces(first: number = 20, skip: number = 0): Promise<Space[]> {
    const query = `
      query Spaces {
        spaces(
          first: ${first},
          skip: ${skip},
          orderBy: "created",
          orderDirection: asc
        ) {
          id
          name
          about
          network
          symbol
          strategies {
            name
            params
          }
          admins
          members
        }
      }
    `;

    const result = await this.queryGraphQL(query);
    return result.spaces;
  }

  async getProposals(spaceId: string, state: string = "all", first: number = 20): Promise<Proposal[]> {
    const query = `
      query Proposals {
        proposals (
          first: ${first},
          skip: 0,
          where: {
            space_in: ["${spaceId}"]
            ${state !== "all" ? `, state: "${state}"` : ''}
          },
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          title
          body
          choices
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
        }
      }
    `;

    const result = await this.queryGraphQL(query);
    return result.proposals;
  }

  async getProposal(proposalId: string): Promise<Proposal> {
    const query = `
      query Proposal {
        proposal(id: "${proposalId}") {
          id
          title
          body
          choices
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
        }
      }
    `;

    const result = await this.queryGraphQL(query);
    return result.proposal;
  }

  async getUser(address: string): Promise<User> {
    const query = `
      query {
        users(first: 1, where: { id_in: ["${address}"] }) {
          id
          name
          about
          avatar
        }
      }
    `;

    const result = await this.queryGraphQL(query);
    return result.users[0];
  }

  async getRankedSpaces(
    first: number = 18, 
    skip: number = 0, 
    category: string = "all",
    search?: string
  ): Promise<RankedSpace[]> {
    const query = `
      query ($first: Int, $skip: Int, $where: RankingWhere) {
        ranking(first: $first, skip: $skip, where: $where) {
          items {
            id
            verified
            turbo
            admins
            members
            name
            avatar
            cover
            network
            about
            website
            twitter
            github
            coingecko
            symbol
            activeProposals
            treasuries {
              name
              network
              address
            }
            labels {
              id
              name
              description
              color
            }
            delegationPortal {
              delegationType
              delegationContract
              delegationNetwork
              delegationApi
            }
            voting {
              delay
              period
              type
              quorum
              quorumType
              privacy
              hideAbstain
            }
            strategies {
              name
              params
              network
            }
            validation {
              name
              params
            }
            filters {
              minScore
              onlyMembers
            }
            proposalsCount
            proposalsCount1d
            proposalsCount30d
            votesCount
            followersCount
            children {
              id
              name
              avatar
              cover
              proposalsCount
              votesCount
              activeProposals
              turbo
              verified
              network
            }
            parent {
              id
              name
              avatar
              cover
              proposalsCount
              votesCount
              activeProposals
              turbo
              verified
              network
            }
            terms
            private
            domain
            skin
            skinSettings {
              bg_color
              link_color
              text_color
              content_color
              border_color
              heading_color
              primary_color
              theme
            }
            guidelines
            template
            categories
            moderators
            plugins
            boost {
              enabled
              bribeEnabled
            }
            voteValidation {
              name
              params
            }
          }
        }
      }
    `;

    const variables = {
      first,
      skip,
      where: {
        category,
        ...(search ? { search } : {})
      }
    };

    const result = await this.queryGraphQL(query, variables);
    return result.ranking.items;
  }
} 