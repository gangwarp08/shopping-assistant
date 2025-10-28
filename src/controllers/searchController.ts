import { getTextEmbedding, getImageEmbedding } from '../services/embeddingService.js';
import { convertToPostgresVector } from '../services/vectorService.js';
import { searchProducts } from '../services/databaseService.js';
import { classifyIntent } from '../services/intentService.js';
import { fetchImageFromUrl } from '../services/imageUrlFetcher.js';

export interface SearchResponse {
  type: 'products' | 'conversation';
  data?: any[];
  message?: string;
}

export async function handleSearchRequest(
  message: string, 
  image?: string
): Promise<SearchResponse> {
  
  // Step 1: Classify intent
  const intentResult = await classifyIntent(message, !!image, image);
  
  // Step 2: Handle based on intent
  switch (intentResult.intent) {
    case 'general_talk':
      console.log('💬 General conversation detected');
      return {
        type: 'conversation',
        message: intentResult.conversationResponse
      };
    
    case 'image_rec':
      console.log('🖼️ Image search detected');
      
      // Get image data (either from attachment or URL)
      let imageData = image;
      if (!imageData && intentResult.imageUrl) {
        imageData = await fetchImageFromUrl(intentResult.imageUrl);
      }
      
      if (!imageData) {
        return {
          type: 'conversation',
          message: "I'd love to help! Could you please upload an image or provide an image URL?"
        };
      }
      
      const imageEmbedding = await getImageEmbedding(imageData);
      const imageVector = convertToPostgresVector({
        data: [{ embedding: imageEmbedding }],
        query: intentResult.cleanedQuery
      });
      
      const imageProducts = await searchProducts(imageVector.vector, true);
      return {
        type: 'products',
        data: imageProducts
      };
    
    case 'text_rec':
      console.log('📝 Text search detected');
      
      // Use cleaned query for better results
      const textEmbedding = await getTextEmbedding(intentResult.cleanedQuery);
      const textVector = convertToPostgresVector({
        data: [{ embedding: textEmbedding }],
        query: intentResult.cleanedQuery
      });
      
      const textProducts = await searchProducts(textVector.vector, false);
      return {
        type: 'products',
        data: textProducts
      };
    
    default:
      return {
        type: 'conversation',
        message: "I'm not sure what you're looking for. Could you describe the product you want?"
      };
  }
}