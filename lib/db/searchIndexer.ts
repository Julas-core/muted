import { Wallpaper, SEED_WALLPAPERS } from '../../constants/seedWallpapers';

export interface SearchWeights {
  /**
   * Score weight applied when a query token matches the wallpaper title.
   * Default: 10
   */
  title: number;

  /**
   * Score weight applied when a query token matches one of the wallpaper tags.
   * Default: 5
   */
  tag: number;

  /**
   * Score weight applied when a query token matches the wallpaper category.
   * Default: 3
   */
  category: number;

  /**
   * Score weight applied when a query token matches the author name.
   * Default: 2
   */
  author: number;

  /**
   * Bonus applied when a query token matches an exact unstemmed token.
   * Default: 2
   */
  exactMatchBonus: number;

  /**
   * Bonus applied when the full query string appears as an exact substring of the title.
   * Default: 12
   */
  fullPhraseTitleBonus: number;
}

export const DEFAULT_SEARCH_WEIGHTS: SearchWeights = {
  title: 10,
  tag: 5,
  category: 3,
  author: 2,
  exactMatchBonus: 2,
  fullPhraseTitleBonus: 12,
};

export type MatchedField = 'title' | 'tag' | 'category' | 'author';

export interface SearchResult {
  wallpaper: Wallpaper;
  score: number;
  matchedTerms: string[];
  matchedFields: MatchedField[];

  // Proxied wallpaper fields for direct convenience
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  url: string | number;
  category: string;
  tags: string[];
  likesCount: number;
  downloadCount: number;
  heightRatio: number;
}

export interface IndexStats {
  documentCount: number;
  uniqueTermsCount: number;
  totalPostings: number;
  constructionTimeMs: number;
}

export interface BenchmarkResult {
  iterations: number;
  datasetSize: number;
  uniqueTermsCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
}

interface DocumentMetadata {
  wallpaper: Wallpaper;
  titleTokens: Set<string>;
  titleStemmed: Set<string>;
  tagTokens: Set<string>;
  tagStemmed: Set<string>;
  categoryTokens: Set<string>;
  categoryStemmed: Set<string>;
  authorTokens: Set<string>;
  authorStemmed: Set<string>;
  rawTitleLower: string;
}

/**
 * Common English stopwords filtered out unless query consists solely of stopwords.
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with',
]);

/**
 * Lightweight English stemmer that handles common plurals, tenses, and derivational suffixes
 * while preserving roots and vowels.
 */
export function stemToken(token: string): string {
  if (token.length <= 3) return token;

  let word = token.toLowerCase();

  // Step 1: Plurals and 'ies'
  if (word.endsWith('sses')) {
    word = word.slice(0, -2);
  } else if (word.endsWith('ies')) {
    word = word.slice(0, -3) + 'i';
  } else if (word.endsWith('ss') || word.endsWith('us') || word.endsWith('is')) {
    // preserve
  } else if (word.endsWith('s')) {
    word = word.slice(0, -1);
  }

  if (word.length <= 3) return word;

  // Step 2: -eed, -ed, -ing
  if (word.endsWith('eed')) {
    const stem = word.slice(0, -3);
    if (/[aeiouy]/.test(stem)) {
      word = word.slice(0, -1);
    }
  } else if (word.endsWith('ed')) {
    const stem = word.slice(0, -2);
    if (stem.length >= 3 && /[aeiouy]/.test(stem)) {
      word = stem;
      if (word.endsWith('at') || word.endsWith('bl') || word.endsWith('iz')) {
        word += 'e';
      }
    }
  } else if (word.endsWith('ing')) {
    const stem = word.slice(0, -3);
    if (stem.length >= 3 && /[aeiouy]/.test(stem)) {
      word = stem;
      if (word.endsWith('at') || word.endsWith('bl') || word.endsWith('iz')) {
        word += 'e';
      }
    }
  }

  if (word.length <= 3) return word;

  // Step 3: Derivational suffixes
  if (word.endsWith('ational')) {
    word = word.slice(0, -7) + 'ate';
  } else if (word.endsWith('tional')) {
    word = word.slice(0, -6) + 'tion';
  } else if (word.endsWith('izer')) {
    word = word.slice(0, -4) + 'ize';
  } else if (word.endsWith('ation')) {
    word = word.slice(0, -5) + 'ate';
  } else if (word.endsWith('ator')) {
    word = word.slice(0, -4) + 'ate';
  } else if (word.endsWith('ful') && word.length > 5) {
    word = word.slice(0, -3);
  } else if (word.endsWith('ness') && word.length > 6) {
    word = word.slice(0, -4);
  } else if (word.endsWith('ment') && word.length > 6) {
    word = word.slice(0, -4);
  } else if (word.endsWith('ly') && word.length > 4) {
    word = word.slice(0, -2);
  }

  return word;
}

export interface TokenItem {
  original: string;
  stemmed: string;
}

/**
 * Splits text into cleaned alphanumeric tokens and their stemmed equivalents.
 * Intelligently expands camelCase / PascalCase compound words (e.g. 'CyberArtist' -> 'cyber', 'artist', 'cyberartist').
 */
export function tokenize(text: string): TokenItem[] {
  if (!text) return [];

  // Expand camelCase/PascalCase boundaries (e.g. "CyberArtist" -> "Cyber Artist", "TokyoSpeed" -> "Tokyo Speed")
  const expandedText = text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  const rawWords = expandedText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  // Also retain the un-split normalized term if it was a compound word
  const fullWord = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const wordList = [...rawWords];
  if (fullWord.length > 0 && !wordList.includes(fullWord)) {
    wordList.push(fullWord);
  }

  const seen = new Set<string>();
  const results: TokenItem[] = [];

  for (const w of wordList) {
    if (!seen.has(w)) {
      seen.add(w);
      results.push({
        original: w,
        stemmed: stemToken(w),
      });
    }
  }

  return results;
}

/**
 * High-performance inverted index search engine for wallpapers.
 * Indexes titles, categories, authors, and tags into a Map<string, Set<string>>.
 */
export class InvertedIndex {
  /**
   * Inverted index: term -> Set of wallpaper IDs.
   */
  public readonly index: Map<string, Set<string>> = new Map();

  /**
   * Internal document metadata mapping: wallpaper ID -> DocumentMetadata.
   */
  private readonly documents: Map<string, DocumentMetadata> = new Map();

  /**
   * Active scoring weights (title match > tag match > author match).
   */
  public readonly weights: SearchWeights;

  /**
   * Measured construction duration in milliseconds for index initialization.
   */
  public constructionTimeMs: number = 0;

  constructor(
    wallpapers: Wallpaper[] = SEED_WALLPAPERS,
    weights: Partial<SearchWeights> = {},
    silent: boolean = false
  ) {
    this.weights = { ...DEFAULT_SEARCH_WEIGHTS, ...weights };
    this.buildIndex(wallpapers, silent);
  }

  /**
   * Builds or rebuilds the inverted index from a collection of wallpapers.
   */
  public buildIndex(wallpapers: Wallpaper[], silent: boolean = false): void {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    this.index.clear();
    this.documents.clear();

    for (const wallpaper of wallpapers) {
      this.indexWallpaper(wallpaper);
    }

    const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.constructionTimeMs = end - start;

    if (!silent) {
      console.log(
        `[InvertedIndex] Indexed ${wallpapers.length} wallpapers (${this.index.size} unique terms) in ${this.constructionTimeMs.toFixed(2)}ms`
      );
    }
  }

  /**
   * Indexes a single wallpaper into the inverted index and document store.
   */
  public indexWallpaper(wallpaper: Wallpaper): void {
    const titleTokensList = tokenize(wallpaper.title);
    const categoryTokensList = tokenize(wallpaper.category);
    const authorTokensList = tokenize(wallpaper.author);
    const tagTokensList = (wallpaper.tags || []).flatMap((t) => tokenize(t));

    const titleTokens = new Set<string>();
    const titleStemmed = new Set<string>();
    for (const t of titleTokensList) {
      titleTokens.add(t.original);
      titleStemmed.add(t.stemmed);
    }

    const categoryTokens = new Set<string>();
    const categoryStemmed = new Set<string>();
    for (const t of categoryTokensList) {
      categoryTokens.add(t.original);
      categoryStemmed.add(t.stemmed);
    }

    const authorTokens = new Set<string>();
    const authorStemmed = new Set<string>();
    for (const t of authorTokensList) {
      authorTokens.add(t.original);
      authorStemmed.add(t.stemmed);
    }

    const tagTokens = new Set<string>();
    const tagStemmed = new Set<string>();
    for (const t of tagTokensList) {
      tagTokens.add(t.original);
      tagStemmed.add(t.stemmed);
    }

    // Combine all unique terms for this document into the inverted index
    const allDocTerms = new Set<string>();
    for (const t of [
      ...titleTokens,
      ...titleStemmed,
      ...categoryTokens,
      ...categoryStemmed,
      ...authorTokens,
      ...authorStemmed,
      ...tagTokens,
      ...tagStemmed,
    ]) {
      allDocTerms.add(t);
    }

    for (const term of allDocTerms) {
      let docSet = this.index.get(term);
      if (!docSet) {
        docSet = new Set<string>();
        this.index.set(term, docSet);
      }
      docSet.add(wallpaper.id);
    }

    this.documents.set(wallpaper.id, {
      wallpaper,
      titleTokens,
      titleStemmed,
      tagTokens,
      tagStemmed,
      categoryTokens,
      categoryStemmed,
      authorTokens,
      authorStemmed,
      rawTitleLower: wallpaper.title.toLowerCase().trim(),
    });
  }

  /**
   * Executes a ranked search query:
   * 1. Cleans and stems/normalizes query tokens.
   * 2. Scores matches with weights (title match > tag match > author match).
   * 3. Returns ranked wallpaper results.
   */
  public search(query: string, maxResults?: number): SearchResult[] {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const rawTokens = tokenize(query);
    if (rawTokens.length === 0) {
      return [];
    }

    // Filter stopwords unless all tokens are stopwords
    const nonStopTokens = rawTokens.filter((t) => !STOP_WORDS.has(t.original));
    const activeTokens = nonStopTokens.length > 0 ? nonStopTokens : rawTokens;

    // Collect candidate wallpaper IDs that contain at least one of the query terms
    const candidateDocIds = new Set<string>();
    for (const token of activeTokens) {
      const matchOriginal = this.index.get(token.original);
      if (matchOriginal) {
        for (const id of matchOriginal) candidateDocIds.add(id);
      }
      const matchStemmed = this.index.get(token.stemmed);
      if (matchStemmed) {
        for (const id of matchStemmed) candidateDocIds.add(id);
      }
    }

    if (candidateDocIds.size === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const rankedResults: SearchResult[] = [];

    for (const docId of candidateDocIds) {
      const doc = this.documents.get(docId);
      if (!doc) continue;

      let score = 0;
      let matchedTokenCount = 0;
      const matchedTerms = new Set<string>();
      const matchedFields = new Set<MatchedField>();

      for (const token of activeTokens) {
        let tokenMatchedInDoc = false;

        // 1. Title match (Weight: title, highest priority)
        const exactTitle = doc.titleTokens.has(token.original);
        const stemmedTitle = doc.titleStemmed.has(token.stemmed);
        if (exactTitle || stemmedTitle) {
          score += this.weights.title;
          if (exactTitle) score += this.weights.exactMatchBonus;
          matchedFields.add('title');
          tokenMatchedInDoc = true;
        }

        // 2. Tag match (Weight: tag, second priority)
        const exactTag = doc.tagTokens.has(token.original);
        const stemmedTag = doc.tagStemmed.has(token.stemmed);
        if (exactTag || stemmedTag) {
          score += this.weights.tag;
          if (exactTag) score += this.weights.exactMatchBonus;
          matchedFields.add('tag');
          tokenMatchedInDoc = true;
        }

        // 3. Category match (Weight: category)
        const exactCat = doc.categoryTokens.has(token.original);
        const stemmedCat = doc.categoryStemmed.has(token.stemmed);
        if (exactCat || stemmedCat) {
          score += this.weights.category;
          if (exactCat) score += this.weights.exactMatchBonus;
          matchedFields.add('category');
          tokenMatchedInDoc = true;
        }

        // 4. Author match (Weight: author, third priority)
        const exactAuthor = doc.authorTokens.has(token.original);
        const stemmedAuthor = doc.authorStemmed.has(token.stemmed);
        if (exactAuthor || stemmedAuthor) {
          score += this.weights.author;
          if (exactAuthor) score += this.weights.exactMatchBonus;
          matchedFields.add('author');
          tokenMatchedInDoc = true;
        }

        if (tokenMatchedInDoc) {
          matchedTokenCount += 1;
          matchedTerms.add(token.original);
        }
      }

      // Bonus for full query phrase matching in title
      if (normalizedQuery.length > 2 && doc.rawTitleLower.includes(normalizedQuery)) {
        score += this.weights.fullPhraseTitleBonus;
      }

      // Multi-token coverage boost: penalize single-term matches when multiple terms searched
      const coverageRatio = matchedTokenCount / activeTokens.length;
      score *= 0.5 + 0.5 * coverageRatio;

      // Small secondary tie-breaker based on popularity (likes)
      const popularityBoost = Math.log10(Math.max(1, doc.wallpaper.likesCount)) * 0.1;
      score += popularityBoost;

      rankedResults.push({
        ...doc.wallpaper,
        wallpaper: doc.wallpaper,
        score: Math.round(score * 100) / 100,
        matchedTerms: Array.from(matchedTerms),
        matchedFields: Array.from(matchedFields),
      });
    }

    // Sort by score descending (stable tie-break by likesCount then ID)
    rankedResults.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.wallpaper.likesCount !== a.wallpaper.likesCount) {
        return b.wallpaper.likesCount - a.wallpaper.likesCount;
      }
      return a.wallpaper.id.localeCompare(b.wallpaper.id);
    });

    if (typeof maxResults === 'number' && maxResults > 0) {
      return rankedResults.slice(0, maxResults);
    }

    return rankedResults;
  }

  /**
   * Retrieves summary statistics about the current index state.
   */
  public getIndexStats(): IndexStats {
    let totalPostings = 0;
    for (const docSet of this.index.values()) {
      totalPostings += docSet.size;
    }

    return {
      documentCount: this.documents.size,
      uniqueTermsCount: this.index.size,
      totalPostings,
      constructionTimeMs: this.constructionTimeMs,
    };
  }

  /**
   * Runs a benchmark verifying index construction time across multiple iterations.
   */
  public static benchmark(
    iterations: number = 50,
    dataset: Wallpaper[] = SEED_WALLPAPERS
  ): BenchmarkResult {
    const times: number[] = [];

    // Warm-up run
    const warmUp = new InvertedIndex(dataset, {}, true);
    const uniqueTermsCount = warmUp.index.size;

    for (let i = 0; i < iterations; i++) {
      const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
      new InvertedIndex(dataset, {}, true);
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      times.push(end - start);
    }

    const totalTimeMs = times.reduce((a, b) => a + b, 0);
    const averageTimeMs = totalTimeMs / iterations;
    const minTimeMs = Math.min(...times);
    const maxTimeMs = Math.max(...times);

    const result: BenchmarkResult = {
      iterations,
      datasetSize: dataset.length,
      uniqueTermsCount,
      totalTimeMs: Math.round(totalTimeMs * 100) / 100,
      averageTimeMs: Math.round(averageTimeMs * 100) / 100,
      minTimeMs: Math.round(minTimeMs * 100) / 100,
      maxTimeMs: Math.round(maxTimeMs * 100) / 100,
    };

    console.log(
      `[InvertedIndex Benchmark] Built index over ${result.datasetSize} wallpapers in avg ${result.averageTimeMs}ms (min: ${result.minTimeMs}ms, max: ${result.maxTimeMs}ms across ${result.iterations} iterations)`
    );

    return result;
  }
}

// ----------------------------------------------------------------------------
// Singleton Instance & Typed Functions
// ----------------------------------------------------------------------------

/**
 * Singleton InvertedIndex instance populated with SEED_WALLPAPERS on startup.
 */
export const searchIndexer = new InvertedIndex(SEED_WALLPAPERS);
export const invertedIndex = searchIndexer;

/**
 * High-level search function querying the singleton searchIndexer.
 */
export function searchWallpapersWithIndex(
  query: string,
  maxResults?: number
): SearchResult[] {
  return searchIndexer.search(query, maxResults);
}

/**
 * Runs a performance benchmark verifying index construction time.
 */
export function benchmarkIndexConstruction(
  iterations?: number,
  dataset?: Wallpaper[]
): BenchmarkResult {
  return InvertedIndex.benchmark(iterations, dataset);
}

export type { Wallpaper };
