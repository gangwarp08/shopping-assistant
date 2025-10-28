import OpenAI from 'openai';
import fetch from 'node-fetch';
import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from '@xenova/transformers';
import dotenv from 'dotenv';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// CLIP model for images
let visionModel: any = null;
let processor: any = null;

async function getImageModel() {
  if (!visionModel) {
    console.log('📥 Loading CLIP vision model (first time only)...');
    visionModel = await CLIPVisionModelWithProjection.from_pretrained('Xenova/clip-vit-base-patch32');
    processor = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32');
    console.log('✅ CLIP model loaded');
  }
  return { visionModel, processor };
}

// Text embedding with text-embedding-3-small (384d, L2 normalized)
export async function getTextEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 384
  });

  const embedding = response.data[0].embedding;
  return normalizeL2(embedding);
}


// Image embedding with CLIP ViT-B/32 (512d, L2 normalized)
export async function getImageEmbedding(imageData: string): Promise<number[]> {
  let imagePath: string;
  let isTemporary = false;
  
  // Handle different image input types
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    // Direct URL - can be used as is
    imagePath = imageData;
  } else if (imageData.startsWith('data:')) {
    // Base64 data URI - save to temporary file
    const base64Data = imageData.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Create temporary file
    const tempPath = join(tmpdir(), `temp_image_${Date.now()}.jpg`);
    writeFileSync(tempPath, imageBuffer);
    imagePath = tempPath;
    isTemporary = true;
  } else {
    throw new Error('Unsupported image format');
  }

  try {
    const { visionModel, processor } = await getImageModel();
    
    // Load image from file path
    const image = await RawImage.fromURL(imagePath);
    const imageInputs = await processor(image);
    
    // Get image embeddings
    const { image_embeds } = await visionModel(imageInputs);
    
    // Convert to array
    const embedding = Array.from(image_embeds.data);
    
    console.log(`📊 Image embedding dimensions: ${embedding.length}`);
    
    return normalizeL2(embedding);
  } finally {
    // Clean up temporary file
    if (isTemporary && imagePath) {
      try {
        unlinkSync(imagePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

// L2 normalization
function normalizeL2(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}