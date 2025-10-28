export interface PriceFilter {
  minPrice?: number;
  maxPrice?: number;
  hasFilter: boolean;
}

export function extractPriceFilter(query: string): PriceFilter {
  const result: PriceFilter = {
    hasFilter: false
  };

  if (!query) return result;

  console.log('🔍 Checking price filter in query:', query);

  // Patterns to match (order matters - most specific first)
  const patterns = [
    // "between $20 and $50"
    { 
      regex: /between\s*\$?(\d+(?:\.\d{1,2})?)\s+and\s*\$?(\d+(?:\.\d{1,2})?)/i,
      type: 'range'
    },
    // "$20 to $50", "$20-$50"
    { 
      regex: /\$?(\d+(?:\.\d{1,2})?)\s*(?:to|-)\s*\$?(\d+(?:\.\d{1,2})?)/i,
      type: 'range'
    },
    // "below $50", "under $50"
    { 
      regex: /(?:below|under)\s*\$?(\d+(?:\.\d{1,2})?)/i,
      type: 'max'
    },
    // "less than $50"
    { 
      regex: /less\s+than\s*\$?(\d+(?:\.\d{1,2})?)/i,
      type: 'max'
    },
    // "up to $50"
    { 
      regex: /up\s+to\s*\$?(\d+(?:\.\d{1,2})?)/i,
      type: 'max'
    },
    // "max $50", "maximum $50"
    { 
      regex: /(?:max|maximum)\s*\$?(\d+(?:\.\d{1,2})?)/i,
      type: 'max'
    },
    // "above $50", "over $50", "more than $50"
    { 
      regex: /(?:above|over|more\s+than)\s*\$?(\d+(?:\.\d{1,2})?)/i,
      type: 'min'
    },
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern.regex);
    if (match) {
      result.hasFilter = true;
      
      if (pattern.type === 'max') {
        result.maxPrice = parseFloat(match[1]);
        console.log(`💰 Max price filter: $${result.maxPrice}`);
      } else if (pattern.type === 'min') {
        result.minPrice = parseFloat(match[1]);
        console.log(`💰 Min price filter: $${result.minPrice}`);
      } else if (pattern.type === 'range' && match[2]) {
        result.minPrice = parseFloat(match[1]);
        result.maxPrice = parseFloat(match[2]);
        console.log(`💰 Price range filter: $${result.minPrice} - $${result.maxPrice}`);
      }
      
      break;
    }
  }

  if (!result.hasFilter) {
    console.log('💰 No price filter detected');
  }

  return result;
}

export function cleanQueryFromPriceFilter(query: string): string {
  if (!query) return '';
  
  // Remove price-related phrases
  let cleaned = query
    .replace(/between\s*\$?\d+(?:\.\d{1,2})?\s+and\s*\$?\d+(?:\.\d{1,2})?/gi, '')
    .replace(/\$?\d+(?:\.\d{1,2})?\s*(?:to|-)\s*\$?\d+(?:\.\d{1,2})?/gi, '')
    .replace(/(?:below|under|less\s+than|up\s+to|max|maximum|above|over|more\s+than)\s*\$?\d+(?:\.\d{1,2})?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('🧹 Cleaned query:', cleaned);
  return cleaned;
}