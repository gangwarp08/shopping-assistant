# 🛍️ Commerce Concierge - AI-Powered Shopping Assistant

Access your personal assistant here - [Try Me](https://shopping-assistant-eta.vercel.app/)

An intelligent shopping assistant that enables semantic product search using both text and images. Built with TypeScript, Express, OpenAI embeddings, and CLIP vision models. 
Drop in a text description or attach an image (file/doc/URL) and I will help you get the best for you.

## ✨ Features

- **AI-Powered Intent Recognition** - Automatically understands user queries
- **Conversational Interface** - Natural chat-based product search
- **Image Search** - Upload photos or provide URLs to find similar products
- **Text Search** - Semantic search using natural language
- **Smart Query Processing** - Cleans and optimizes search queries
- **Real-time Results** - Fast semantic similarity search
- **Beautiful UI** - Responsive chat interface with product cards
- **Hybrid search** -  (text + image combined) Show me shirts below $50
- **Price/rating filters** - Show me shirts below $50

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS)
    ↓
Express Server (TypeScript)
    ↓
Intent Classifier (OpenAI GPT-4)
    ↓
┌─────────────┬────────────────┐
│  Text Search│  Image Search  │
│  (OpenAI)   │  (CLIP ViT)    │
│  384d       │  512d          │
└─────────────┴────────────────┘
    ↓
PostgreSQL + pgvector
    ↓
Product Results
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- PostgreSQL database with pgvector extension

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/commerce-concierge.git
cd commerce-concierge
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

4. **Run development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

## 📦 Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js + Express |
| Language | TypeScript |
| Intent Classification | OpenAI GPT-4o-mini |
| Text Embeddings | OpenAI text-embedding-3-small (384d) |
| Image Embeddings | CLIP ViT-B/32 (512d) |
| Database | PostgreSQL + pgvector |
| Frontend | HTML/CSS/Vanilla JS |
| File Upload | Multer |
| Deployment | Vercel |

## 🎯 How It Works

### 1. Intent Classification
Every user query is analyzed by GPT-4o-mini to determine:
- **general_talk**: Greetings, questions about the assistant
- **text_rec**: Product search using text descriptions
- **image_rec**: Product search using images

### 2. Search Pipeline

**Text Search:**
```
User Query → Query Cleaning → OpenAI Embedding (384d) 
→ PostgreSQL Vector Search → Top 5 Products
```

**Image Search:**
```
Image Upload/URL → CLIP Vision Model (512d) 
→ PostgreSQL Vector Search → Top 5 Products
```

### 3. Response Handling
- **Products**: Displayed as interactive cards
- **Conversation**: Friendly responses with follow-up questions

## 📂 Project Structure

```
commerce-concierge/
├── src/
│   ├── app.ts                      # Express server
│   ├── controllers/
│   │   └── searchController.ts     # Search orchestration
│   └── services/
│       ├── intentService.ts        # Intent classification
│       ├── embeddingService.ts     # AI embeddings
│       ├── vectorService.ts        # Vector formatting
│       ├── databaseService.ts      # Database queries
│       └── imageUrlFetcher.ts      # Image URL handling
├── public/
│   └── index.html                  # Chat UI
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
└── vercel.json                     # Vercel config
```

## 🗄️ Database Schema

```sql
CREATE TABLE catalog_items (
  unique_id TEXT PRIMARY KEY,
  title_desc TEXT,
  img_url TEXT,
  product_url TEXT,
  stars FLOAT,
  price FLOAT,
  text_embedding vector(384),
  image_embedding vector(512)
);

-- Indexes for fast similarity search
CREATE INDEX ON catalog_items 
  USING ivfflat (text_embedding vector_l2_ops);
CREATE INDEX ON catalog_items 
  USING ivfflat (image_embedding vector_l2_ops);
```

## 🌐 API Endpoints

### POST `/api/chat`

**Request:**
```typescript
FormData {
  message: string,
  requestId: string,
  image?: File
}
```

**Response (Products):**
```json
[
  {
    "id": "B09N6D3BD1",
    "title": "Men's Xx Chino Ez Pants",
    "img": "https://...",
    "product": "https://amazon.com/...",
    "stars": 4.3,
    "price": 41.7,
    "similarity": 0.89
  }
]
```

**Response (Conversation):**
```json
{
  "reply": "Hi! I'm Commerce Concierge. What are you shopping for today?"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |


### Vercel Configuration

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/app.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 📊 Performance

- **Text Search**: 200-500ms
- **Image Search (First)**: 5-10s (model download)
- **Image Search (Cached)**: 1-3s
- **Intent Classification**: 100-300ms
- **Database Query**: 50-100ms

## 🛡️ Security

-  Request deduplication (2s window)
-  Input validation
-  File type checking
-  Environment variable protection
-  Temporary file cleanup
-  Error handling
-  SQL injection prevention (parameterized queries)

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Set Environment Variables**
```bash
vercel env add OPENAI_API_KEY
vercel env add DATABASE_URL
```

### Alternative: GitHub + Vercel Integration

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Add environment variables
4. Deploy automatically on push

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```



## 📈 Roadmap

- [ ] Pagination
- [ ] User authentication
- [ ] Search history
- [ ] Shopping cart
- [ ] Multi-language support
- [ ] Mobile app

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👨‍💻 Author

Your Name - [@linkedin](https://www.linkedin.com/in/prakhar-gangwar/)


## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for embeddings and GPT models
- [Hugging Face](https://huggingface.co/) for CLIP model
- [Xenova/transformers.js](https://github.com/xenova/transformers.js) for browser-compatible models
- [Neon](https://neon.tech/) for PostgreSQL hosting
- [Vercel](https://vercel.com/) for deployment platform

## 📞 Support

- 📧 Email: prakhar.gangwar08@gmail.com

---

Made with ❤️ and Claude
=======
