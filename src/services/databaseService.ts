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

export async function searchProducts(vectorString: string, isImageSearch: boolean = false, limit: number = 5): Promise<Product[]> {
  // Use different embedding column based on search type
  const embeddingColumn = isImageSearch ? 'image_embedding' : 'text_embedding';
  
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
    ORDER BY ${embeddingColumn} <=> $1::vector
    LIMIT $2
  `;

  const result = await pool.query(query, [vectorString, limit]);
  
  return result.rows.map(row => ({
    ...row,
    price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
    stars: typeof row.stars === 'string' ? parseFloat(row.stars) : row.stars
  }));
}