import { Wallpaper, SEED_WALLPAPERS } from '../../constants/seedWallpapers';

export type SortField = 'likes' | 'downloads' | 'title' | 'likesCount' | 'downloadCount';
export type SortDirection = 'asc' | 'desc';
export type TagMatchMode = 'any' | 'all';

export interface TagFilterConfig {
  /**
   * List of tags to filter by.
   */
  tags?: string[];
  values?: string[];

  /**
   * Tag match mode: 'any' matches if wallpaper contains at least one tag,
   * 'all' requires wallpaper to contain all specified tags.
   */
  match?: TagMatchMode;
  mode?: TagMatchMode;
}

export type TagsFilter = string[] | string | TagFilterConfig;

export interface QueryFilter {
  /**
   * Filter by category name or slug (e.g. 'Anime & Manga', 'anime-manga').
   * Supports single category string or array of categories. Case-insensitive.
   * If 'All' or 'all' is passed, category filtering is skipped.
   */
  category?: string | string[];

  /**
   * Filter by one or more tags. Supports array of strings, single string,
   * or a configuration object with match mode.
   */
  tags?: TagsFilter;

  /**
   * Match strategy when multiple tags are specified:
   * - 'any': wallpaper must match at least one specified tag (default)
   * - 'all': wallpaper must contain all specified tags
   */
  tagMatchMode?: TagMatchMode;
  tagsMatch?: TagMatchMode; // Alias for convenience
  match?: TagMatchMode; // Alias for convenience

  /**
   * Minimum like count (inclusive).
   */
  minLikes?: number;
}

export interface QuerySort {
  /**
   * Field to sort by: 'likes' (likesCount), 'downloads' (downloadCount), or 'title'.
   */
  by?: SortField;
  field?: SortField;

  /**
   * Sort direction: 'asc' or 'desc'.
   * Defaults to 'desc' for 'likes' and 'downloads', and 'asc' for 'title'.
   */
  direction?: SortDirection;
  order?: SortDirection;
}

export interface QueryPagination {
  /**
   * Maximum number of items to return in current page.
   */
  limit?: number;

  /**
   * Cursor identifier (wallpaper ID or numeric offset string).
   * Slicing starts immediately after this item.
   */
  cursor?: string | null;

  /**
   * Numeric 0-based offset. Used when cursor is not provided or as fallback.
   */
  offset?: number;
}

export interface QueryOptions {
  /**
   * Structured filter options.
   */
  filter?: QueryFilter;

  /**
   * Sorting options.
   */
  sort?: QuerySort | SortField;

  /**
   * Cursor-based / offset pagination options.
   */
  pagination?: QueryPagination;

  /**
   * Case-insensitive search query matching title, author, or tags.
   */
  searchQuery?: string;

  // Flattened shortcuts for developer convenience
  category?: string | string[];
  tags?: TagsFilter;
  tagMatchMode?: TagMatchMode;
  tagsMatch?: TagMatchMode;
  match?: TagMatchMode;
  minLikes?: number;
  sortBy?: SortField;
  sortDirection?: SortDirection;
  limit?: number;
  cursor?: string | null;
  offset?: number;
}

export interface QueryResult<T = Wallpaper> {
  items: T[];
  total: number;
  limit?: number;
  offset: number;
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
}

/**
 * Normalizes strings for resilient comparison across slug, display, and 'and' variations
 * (e.g. 'Anime & Manga' vs 'anime-manga' vs 'anime and manga').
 */
function cleanCategoryKey(val: string): string {
  return val
    .toLowerCase()
    .replace(/\band\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function matchesCategory(wallpaperCategory: string, targetCategory: string): boolean {
  if (!targetCategory || targetCategory.trim().toLowerCase() === 'all') {
    return true;
  }
  const targetLower = targetCategory.trim().toLowerCase();
  const wallpaperLower = (wallpaperCategory || '').trim().toLowerCase();
  if (targetLower === wallpaperLower) {
    return true;
  }
  return cleanCategoryKey(wallpaperCategory || '') === cleanCategoryKey(targetCategory);
}

/**
 * In-memory local database and query engine for wallpapers.
 */
export class WallpaperDatabase {
  private wallpapers: Wallpaper[];

  constructor(initialData: Wallpaper[] = SEED_WALLPAPERS) {
    this.wallpapers = [...initialData];
  }

  /**
   * Executes a query against the in-memory wallpapers collection with filtering,
   * searching, sorting, and cursor-based pagination.
   */
  public query(options: QueryOptions = {}): QueryResult<Wallpaper> {
    const {
      filter,
      sort,
      pagination,
      searchQuery,
      // Fallback to top-level flattened options if present
      category = filter?.category,
      tags = filter?.tags,
      tagMatchMode = filter?.tagMatchMode ?? filter?.tagsMatch ?? filter?.match ?? 'any',
      minLikes = filter?.minLikes,
      sortBy = typeof sort === 'string' ? sort : (sort?.by ?? sort?.field),
      sortDirection = typeof sort === 'object' ? (sort?.direction ?? sort?.order) : undefined,
      limit = pagination?.limit,
      cursor = pagination?.cursor,
      offset = pagination?.offset,
    } = options;

    let result = [...this.wallpapers];

    // 1. Filter: Category
    if (category !== undefined) {
      if (Array.isArray(category)) {
        const activeCategories = category.filter((c) => c && c.toLowerCase() !== 'all');
        if (activeCategories.length > 0) {
          result = result.filter((item) =>
            activeCategories.some((cat) => matchesCategory(item.category, cat))
          );
        }
      } else if (category && category.toLowerCase() !== 'all') {
        result = result.filter((item) => matchesCategory(item.category, category));
      }
    }

    // 2. Filter: Tags (any / all match)
    let filterTags: string[] = [];
    let effectiveTagMatchMode: TagMatchMode = tagMatchMode;

    if (Array.isArray(tags)) {
      filterTags = tags;
    } else if (typeof tags === 'string') {
      filterTags = [tags];
    } else if (tags && typeof tags === 'object') {
      const config = tags as TagFilterConfig;
      filterTags = config.values || config.tags || [];
      if (config.match) effectiveTagMatchMode = config.match;
      if (config.mode) effectiveTagMatchMode = config.mode;
    }

    if (filterTags.length > 0) {
      const normalizedFilterTags = filterTags.map((t) => t.trim().toLowerCase()).filter(Boolean);

      if (normalizedFilterTags.length > 0) {
        result = result.filter((item) => {
          const itemTags = Array.isArray(item.tags)
            ? item.tags.map((t) => (t || '').trim().toLowerCase())
            : [];
          if (effectiveTagMatchMode === 'all') {
            return normalizedFilterTags.every((ft) => itemTags.includes(ft));
          }
          // Default: 'any'
          return normalizedFilterTags.some((ft) => itemTags.includes(ft));
        });
      }
    }

    // 3. Filter: minLikes
    if (typeof minLikes === 'number' && !Number.isNaN(minLikes)) {
      result = result.filter((item) => (item.likesCount ?? 0) >= minLikes);
    }

    // 4. Search Query: case-insensitive across title, author, and tags
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);

      result = result.filter((item) => {
        const titleLower = (item.title || '').toLowerCase();
        const authorLower = (item.author || '').toLowerCase();
        const tagsLower = Array.isArray(item.tags)
          ? item.tags.map((t) => (t || '').toLowerCase())
          : [];

        // Full query direct substring match
        const directMatch =
          titleLower.includes(q) ||
          authorLower.includes(q) ||
          tagsLower.some((t) => t.includes(q));

        if (directMatch) return true;

        // If query contains multiple words, verify all tokens match at least one field
        if (tokens.length > 1) {
          return tokens.every(
            (token) =>
              titleLower.includes(token) ||
              authorLower.includes(token) ||
              tagsLower.some((t) => t.includes(token))
          );
        }

        return false;
      });
    }

    // 5. Sort: by 'likes' | 'downloads' | 'title', direction 'asc' | 'desc'
    if (sortBy) {
      const isTitle = sortBy === 'title';
      const dir =
        sortDirection ?? (isTitle ? 'asc' : 'desc');
      const multiplier = dir === 'asc' ? 1 : -1;

      result.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'likes' || (sortBy as string) === 'likesCount') {
          comparison = (a.likesCount ?? 0) - (b.likesCount ?? 0);
        } else if (sortBy === 'downloads' || (sortBy as string) === 'downloadCount') {
          comparison = (a.downloadCount ?? 0) - (b.downloadCount ?? 0);
        } else if (sortBy === 'title') {
          comparison = (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
        }

        if (comparison !== 0) {
          return comparison * multiplier;
        }

        // Stable tie-breaker by ID
        return (a.id || '').localeCompare(b.id || '');
      });
    }

    const total = result.length;

    // 6. Pagination: cursor-based pagination (limit and cursor/offset)
    let startIndex = 0;

    if (cursor) {
      const cursorIndex = result.findIndex((item) => item.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      } else if (typeof offset === 'number' && offset >= 0) {
        startIndex = offset;
      } else {
        const parsedOffset = Number(cursor);
        if (!Number.isNaN(parsedOffset) && parsedOffset >= 0 && Number.isInteger(parsedOffset)) {
          startIndex = parsedOffset;
        }
      }
    } else if (typeof offset === 'number' && offset >= 0) {
      startIndex = offset;
    }

    // Slicing
    let pagedItems: Wallpaper[];
    let hasMore = false;

    if (typeof limit === 'number' && limit > 0) {
      pagedItems = result.slice(startIndex, startIndex + limit);
      hasMore = startIndex + pagedItems.length < total;
    } else {
      pagedItems = result.slice(startIndex);
      hasMore = false;
    }

    const nextCursor =
      hasMore && pagedItems.length > 0 ? pagedItems[pagedItems.length - 1].id : null;
    const prevCursor =
      startIndex > 0 && result.length > 0
        ? result[Math.max(0, startIndex - 1)]?.id ?? null
        : null;

    return {
      items: pagedItems,
      total,
      limit,
      offset: startIndex,
      nextCursor,
      prevCursor,
      hasMore,
    };
  }

  /**
   * Returns an aggregated count of wallpapers per category.
   * If an optional filter is provided, aggregates counts for the filtered subset.
   */
  public getCategoryCounts(
    options?: Pick<QueryOptions, 'searchQuery' | 'filter' | 'minLikes' | 'tags'>
  ): Record<string, number> {
    const data = options
      ? this.query({ ...options, pagination: undefined, sort: undefined }).items
      : this.wallpapers;

    const counts: Record<string, number> = {};
    for (const item of data) {
      const cat = item.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    }

    return counts;
  }

  /**
   * Retrieves all wallpapers currently in the database.
   */
  public getAll(): Wallpaper[] {
    return [...this.wallpapers];
  }

  /**
   * Finds a wallpaper by its unique ID.
   */
  public getById(id: string): Wallpaper | undefined {
    return this.wallpapers.find((item) => item.id === id);
  }

  /**
   * Adds a new wallpaper to the database.
   */
  public addWallpaper(wallpaper: Wallpaper): void {
    const existingIndex = this.wallpapers.findIndex((w) => w.id === wallpaper.id);
    if (existingIndex >= 0) {
      this.wallpapers[existingIndex] = wallpaper;
    } else {
      this.wallpapers.unshift(wallpaper);
    }
  }

  /**
   * Updates an existing wallpaper by ID.
   */
  public updateWallpaper(id: string, updates: Partial<Wallpaper>): Wallpaper | undefined {
    const index = this.wallpapers.findIndex((w) => w.id === id);
    if (index === -1) return undefined;

    const updated = { ...this.wallpapers[index], ...updates };
    this.wallpapers[index] = updated;
    return updated;
  }

  /**
   * Removes a wallpaper by ID. Returns true if removed, false otherwise.
   */
  public deleteWallpaper(id: string): boolean {
    const initialLength = this.wallpapers.length;
    this.wallpapers = this.wallpapers.filter((w) => w.id !== id);
    return this.wallpapers.length < initialLength;
  }

  /**
   * Resets database state to the original seed data or provided custom dataset.
   */
  public reset(seedData: Wallpaper[] = SEED_WALLPAPERS): void {
    this.wallpapers = [...seedData];
  }

  /**
   * Returns total count of wallpapers in the database.
   */
  public count(): number {
    return this.wallpapers.length;
  }
}

// ----------------------------------------------------------------------------
// Singletons & Typed Query Functions
// ----------------------------------------------------------------------------

/**
 * Singleton database instance loaded with SEED_WALLPAPERS.
 */
export const wallpaperDb = new WallpaperDatabase();
export const wallpaperDatabase = wallpaperDb;

/**
 * Executes a typed query against the singleton wallpaper database.
 */
export function queryWallpapers(options?: QueryOptions): QueryResult<Wallpaper> {
  return wallpaperDb.query(options);
}

/**
 * Aggregates and returns the count of wallpapers per category.
 */
export function getCategoryCounts(
  options?: Pick<QueryOptions, 'searchQuery' | 'filter' | 'minLikes' | 'tags'>
): Record<string, number> {
  return wallpaperDb.getCategoryCounts(options);
}

/**
 * Retrieves all wallpapers from the singleton database.
 */
export function getAllWallpapers(): Wallpaper[] {
  return wallpaperDb.getAll();
}

/**
 * Retrieves a wallpaper by ID from the database.
 */
export function getWallpaperById(id: string): Wallpaper | undefined {
  return wallpaperDb.getById(id);
}

/**
 * Query wallpapers by category with optional pagination and sorting.
 */
export function getWallpapersByCategory(
  category: string | string[],
  options?: Omit<QueryOptions, 'category'>
): QueryResult<Wallpaper> {
  return wallpaperDb.query({
    ...options,
    filter: {
      ...options?.filter,
      category,
    },
  });
}

/**
 * Search wallpapers by keyword across title, author, and tags.
 */
export function searchWallpapers(
  searchQuery: string,
  options?: Omit<QueryOptions, 'searchQuery'>
): QueryResult<Wallpaper> {
  return wallpaperDb.query({
    ...options,
    searchQuery,
  });
}

/**
 * Retrieves the top wallpapers sorted by likes or downloads.
 */
export function getTopWallpapers(
  by: 'likes' | 'downloads' = 'likes',
  limit: number = 10
): Wallpaper[] {
  return wallpaperDb.query({
    sort: { by, direction: 'desc' },
    pagination: { limit },
  }).items;
}

/**
 * Inserts or replaces a wallpaper in the singleton database.
 */
export function addWallpaper(wallpaper: Wallpaper): void {
  wallpaperDb.addWallpaper(wallpaper);
}

/**
 * Updates a wallpaper by ID in the singleton database.
 */
export function updateWallpaper(id: string, updates: Partial<Wallpaper>): Wallpaper | undefined {
  return wallpaperDb.updateWallpaper(id, updates);
}

/**
 * Deletes a wallpaper by ID from the singleton database.
 */
export function deleteWallpaper(id: string): boolean {
  return wallpaperDb.deleteWallpaper(id);
}

/**
 * Resets the singleton database to the original seed data or a custom dataset.
 */
export function resetWallpaperDatabase(seedData?: Wallpaper[]): void {
  wallpaperDb.reset(seedData);
}

export type { Wallpaper };
