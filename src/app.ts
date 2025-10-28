import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { handleSearchRequest } from './controllers/searchController.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static('public'));

// Request deduplication
const recentRequests = new Set<string>();
const DEBOUNCE_TIME = 2000; // 2 seconds

function isDuplicate(requestId: string): boolean {
  if (recentRequests.has(requestId)) {
    return true;
  }
  
  recentRequests.add(requestId);
  
  // Clean up after debounce time
  setTimeout(() => {
    recentRequests.delete(requestId);
  }, DEBOUNCE_TIME);
  
  return false;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Main endpoint - processes everything locally on the server
app.post('/api/chat', upload.single('image'), async (req, res) => {
  const requestId = req.body.requestId as string;

  if (!requestId) {
    console.log('❌ No request ID provided');
    return res.status(400).json({ reply: 'Invalid request' });
  }

  if (isDuplicate(requestId)) {
    console.log('🚫 Duplicate request ignored:', requestId);
    return res.status(429).end();
  }

  console.log('📨 Request received');
  
  try {
    const { message } = req.body;
    
    if (!message) {
      console.log('❌ No message provided');
      return res.status(400).json({ 
        reply: "Please provide a message!" 
      });
    }

    console.log('📨 Message:', message);
    console.log('🖼️ Has image:', !!req.file);

    let imageData: string | undefined;

    if (req.file) {
      try {
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        imageData = `data:${mimeType};base64,${base64Image}`;
        console.log('✅ Image processed');
      } catch (imgError) {
        console.error('❌ Image processing error:', imgError);
        return res.status(500).json({
          reply: "Error processing image. Please try again!"
        });
      }
    }

    console.log('🔍 Starting intelligent search...');
    
    // Use updated search controller
    const result = await handleSearchRequest(message, imageData);

    console.log(`✅ Result type: ${result.type}`);
    
    if (result.type === 'conversation') {
      // Return conversation response
      return res.status(200).json({ 
        reply: result.message 
      });
    } else {
      // Return products
      const products = result.data || [];
      console.log(`✅ Found ${products.length} products`);
      return res.status(200).json(products);
    }
    
  } catch (error: any) {
    console.error('❌ Error in /api/chat:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      reply: `Error: ${error.message || 'Something went wrong. Please try again!'}` 
    });
  }
});app.post('/api/chat', upload.single('image'), async (req, res) => {
  const requestId = req.body.requestId as string;

  if (!requestId) {
    console.log('❌ No request ID provided');
    return res.status(400).json({ reply: 'Invalid request' });
  }

  if (isDuplicate(requestId)) {
    console.log('🚫 Duplicate request ignored:', requestId);
    return res.status(429).end();
  }

  console.log('📨 Request received');
  
  try {
    const { message } = req.body;
    
    if (!message) {
      console.log('❌ No message provided');
      return res.status(400).json({ 
        reply: "Please provide a message!" 
      });
    }

    console.log('📨 Message:', message);
    console.log('🖼️ Has image:', !!req.file);

    let imageData: string | undefined;

    if (req.file) {
      try {
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        imageData = `data:${mimeType};base64,${base64Image}`;
        console.log('✅ Image processed');
      } catch (imgError) {
        console.error('❌ Image processing error:', imgError);
        return res.status(500).json({
          reply: "Error processing image. Please try again!"
        });
      }
    }

    console.log('🔍 Starting intelligent search...');
    
    // Use updated search controller
    const result = await handleSearchRequest(message, imageData);

    console.log(`✅ Result type: ${result.type}`);
    
    if (result.type === 'conversation') {
      // Return conversation response
      return res.status(200).json({ 
        reply: result.message 
      });
    } else {
      // Return products
      const products = result.data || [];
      console.log(`✅ Found ${products.length} products`);
      return res.status(200).json(products);
    }
    
  } catch (error: any) {
    console.error('❌ Error in /api/chat:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      reply: `Error: ${error.message || 'Something went wrong. Please try again!'}` 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Shopping Assistant running on http://localhost:${PORT}`);
  console.log(`📍 Processing all requests locally - no external webhooks`);
});