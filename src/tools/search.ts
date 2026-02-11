import { BookStackClient } from '../api/client';
import { ValidationHandler } from '../validation/validator';
import { Logger } from '../utils/logger';
import { MCPTool } from '../types';

/**
 * Search tools for BookStack MCP Server
 * 
 * Provides comprehensive search functionality across all content types
 */
export class SearchTools {
  constructor(
    private client: BookStackClient,
    private validator: ValidationHandler,
    private logger: Logger
  ) {}

  /**
   * Get all search tools
   */
  getTools(): MCPTool[] {
    return [
      this.createSearchTool(),
    ];
  }

  /**
   * Search tool
   */
  private createSearchTool(): MCPTool {
    return {
      name: 'bookstack_search',
      description: 'Search across all BookStack content (Books, Chapters, Pages, Shelves). Supports advanced query syntax for filtering.',
      inputSchema: {
        type: 'object',
        required: ['query'],
        properties: {
          query: {
            type: 'string',
            minLength: 1,
            description: 'Search query string. Supports advanced syntax: "exact phrase", {type:page|book|chapter|shelf}, {tag:name=value}, {created_by:me}.',
          },
          page: {
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number for pagination.',
          },
          count: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
            description: 'Results per page.',
          },
        },
      },
      examples: [
        {
          description: 'Search for "API" in pages only',
          input: { query: 'API {type:page}' },
          expected_output: 'List of matching pages',
          use_case: 'Finding specific documentation',
        },
        {
          description: 'Search by tag',
          input: { query: '{tag:status=active}' },
          expected_output: 'Content with status:active tag',
          use_case: 'Filtering by metadata',
        }
      ],
      usage_patterns: [
        'Use specific filters like `{type:book}` to narrow down results',
        'Use quotes for exact match searches: `"error code 500"`',
      ],
      related_tools: ['bookstack_pages_list', 'bookstack_books_list'],
      error_codes: [
        {
          code: 'VALIDATION_ERROR',
          description: 'Empty query',
          recovery_suggestion: 'Provide a search term',
        }
      ],
      handler: async (params: any) => {
        this.logger.info('Searching content', { query: params.query, page: params.page, count: params.count });
        const validatedParams = this.validator.validateParams<any>(params, 'search');
        return await this.client.search(validatedParams);
      },
    };
  }
}

export default SearchTools;