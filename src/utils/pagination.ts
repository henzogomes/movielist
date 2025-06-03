import { Database } from "sqlite3";

export interface PaginationParams {
  page?: string;
  limit?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  message: string;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: T[];
}

export class PaginationHelper {
  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_LIMIT = 10;
  static readonly MAX_LIMIT = 100;

  static parseParams(query: PaginationParams): PaginationOptions {
    const page = Math.max(
      1,
      parseInt(query.page || "1", 10) || this.DEFAULT_PAGE
    );
    const limit = Math.min(
      this.MAX_LIMIT,
      Math.max(1, parseInt(query.limit || "10", 10) || this.DEFAULT_LIMIT)
    );
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  static createResponse<T>(
    data: T[],
    totalItems: number,
    options: PaginationOptions,
    message: string
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalItems / options.limit);
    const hasNext = options.page < totalPages;
    const hasPrev = options.page > 1;

    return {
      message,
      pagination: {
        page: options.page,
        limit: options.limit,
        totalItems,
        totalPages,
        hasNext,
        hasPrev,
      },
      data,
    };
  }

  static buildCountQuery(baseQuery: string): string {
    const fromIndex = baseQuery.toLowerCase().indexOf("from");
    if (fromIndex === -1) {
      throw new Error("Invalid query: no FROM clause found");
    }

    const fromClause = baseQuery.substring(fromIndex);
    return `SELECT COUNT(*) as total ${fromClause}`;
  }

  static buildPaginatedQuery(
    baseQuery: string,
    options: PaginationOptions
  ): string {
    return `${baseQuery} LIMIT ${options.limit} OFFSET ${options.offset}`;
  }

  static async getPaginatedData<T>(
    db: Database,
    baseQuery: string,
    pagination: PaginationOptions,
    message: string
  ): Promise<PaginatedResponse<T>> {
    return new Promise((resolve, reject) => {
      // get total count
      const countQuery = this.buildCountQuery(baseQuery);

      db.get(countQuery, (countErr: Error | null, countRow: CountResult) => {
        if (countErr) {
          reject(new Error(`Error counting records: ${countErr.message}`));
          return;
        }

        const totalItems = countRow.total;

        // get paginated data
        const paginatedQuery = this.buildPaginatedQuery(baseQuery, pagination);

        db.all(paginatedQuery, (dataErr: Error | null, rows: T[]) => {
          if (dataErr) {
            reject(new Error(`Error fetching data: ${dataErr.message}`));
            return;
          }

          const response = this.createResponse(
            rows,
            totalItems,
            pagination,
            message
          );
          resolve(response);
        });
      });
    });
  }
}

interface CountResult {
  total: number;
}
