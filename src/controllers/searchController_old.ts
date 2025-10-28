import { getTextEmbedding, getImageEmbedding } from '../services/embeddingService.js';
import { convertToPostgresVector } from '../services/vectorService.js';
import { searchProducts } from '../services/databaseService.js';
import { processImageInput } from '../services/imageProcessor.js';

export async function handleSearchRequest(message: string, image?: string) {
  let embedding: number[];
  let isImageSearch = false;

  if (!image) {
    console.log('Processing text-only search...');
    embedding = await getTextEmbedding(message);
  } else {
    console.log('Processing image search...');
    embedding = await getImageEmbedding(image);
    isImageSearch = true;
  }

  const vectorData = convertToPostgresVector({
    data: [{ embedding }],
    query: message
  });

  console.log('Vector generated:', vectorData.ok ? 'Success' : 'Failed');

  // Pass isImageSearch flag to use correct column
  const products = await searchProducts(vectorData.vector, isImageSearch);

  return products;
}