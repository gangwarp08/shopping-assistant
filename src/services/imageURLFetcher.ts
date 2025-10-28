import fetch from 'node-fetch';

export async function fetchImageFromUrl(imageUrl: string): Promise<string> {
  console.log(`🌐 Fetching image from URL: ${imageUrl}`);
  
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Convert to base64 data URI
    const base64 = buffer.toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;
    
    console.log(`✅ Image fetched successfully`);
    return dataUri;
    
  } catch (error) {
    console.error(`❌ Error fetching image from URL:`, error);
    throw new Error('Failed to fetch image from provided URL');
  }
}