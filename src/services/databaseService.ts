import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export interface Product {
  id: string;
  title: string;
  img: string;
  product: string;
  stars: number;
  price: number;
  similarity: number;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
}

export async function searchProducts(
  vectorString: string, 
  isImageSearch: boolean = false, 
  limit: number = 5,
  filters?: SearchFilters
): Promise<Product[]> {
  
  const embeddingColumn = isImageSearch ? 'image_embedding' : 'text_embedding';
  
  // Build WHERE clause for price filters
  let whereClause = '';
  const queryParams: any[] = [vectorString, limit];
  let paramIndex = 3;
  
  if (filters?.minPrice !== undefined) {
    whereClause += ` AND price >= $${paramIndex}`;
    queryParams.push(filters.minPrice);
    paramIndex++;
  }
  
  if (filters?.maxPrice !== undefined) {
    whereClause += ` AND price <= $${paramIndex}`;
    queryParams.push(filters.maxPrice);
    paramIndex++;
  }
  
  const query = `
    SELECT
      unique_id   AS id,
      title_desc  AS title,
      img_url     AS img,
      product_url AS product,
      stars,
      price::float AS price,
      1 - (${embeddingColumn} <=> $1::vector) AS similarity
    FROM catalog_items
    WHERE 1=1${whereClause}
    ORDER BY ${embeddingColumn} <=> $1::vector
    LIMIT $2
  `;

  console.log('🔍 Database query with filters:', { 
    isImageSearch, 
    filters,
    whereClause 
  });

  const result = await pool.query(query, queryParams);
  
  return result.rows.map(row => ({
    ...row,
    price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
    stars: typeof row.stars === 'string' ? parseFloat(row.stars) : row.stars
  }));
}