# M32 AI Server

A production-ready Express.js server with advanced multi-agent research capabilities using LangChain, Google OAuth authentication, and real-time WebSocket communication.

## Features

- 🚀 Express.js 5.x with modern middleware
- 🔒 Security headers with Helmet
- 🌐 CORS enabled with Google OAuth support
- 📝 Request logging with Morgan
- 🛡️ Error handling middleware
- 🔍 Health check endpoint
- 📁 Organized route structure
- 🗄️ MongoDB integration with Mongoose
- 👥 User management with validation
- 🔐 **Google OAuth 2.0 Authentication** with JWT verification
- 📘 TypeScript support with strict typing
- 🤖 **Multi-Agent Research System** with LangChain
- 🔧 **Intelligent Tool Selection** and parallel execution
- 🌐 **Web Search** via Perplexity AI
- 📚 **Wikipedia Integration** for knowledge retrieval
- 🧮 **Calculator & Statistics** tools
- ⚡ **Caching Layer** for optimized performance
- 🔄 **Fallback Mechanisms** for robust operation
- 🔌 **WebSocket Support** for real-time communication
- 🛡️ **Session Management** with secure authentication

## Installation

Install dependencies:

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the server with nodemon and ts-node for auto-restart on file changes.

### Production

```bash
npm run build
npm start
```

The `build` command compiles TypeScript to JavaScript in the `dist/` folder.

## API Endpoints

### Base Routes

- `GET /` - Welcome message
- `GET /health` - Health check

### LLM & Research Routes

- `POST /llm/chat` - Basic chat with LLM
- `POST /llm/multi-agent` - Multi-agent research workflow (Research → Write → Review)
- `POST /llm/advanced-research` - **Enhanced multi-tool research with intelligent selection**
- `GET /llm/tools` - Get available tools and their metadata
- `POST /llm/tools/clear-cache` - Clear tool response cache

### API Routes

- `GET /api/status` - API status with database connection info
- `GET /api/users` - Get all users (requires authentication)
- `POST /api/signup` - User registration with email & password
- `POST /api/signin` - User authentication with email & password
- `POST /api/google-signin` - Google OAuth authentication with ID token
- `POST /api/logout` - User logout and session cleanup

## Multi-Tool Research System

### Available Tools

1. **Perplexity Search** (`perplexity_search`)

   - Real-time web search with up-to-date information
   - Category: `search`
   - Keywords: search, web, current, news, recent, online

2. **Wikipedia Search** (`wikipedia_search`)

   - Structured knowledge from Wikipedia
   - Category: `knowledge`
   - Keywords: wikipedia, definition, explain, encyclopedia, facts

3. **Calculator** (`calculator`)

   - Mathematical calculations and expressions
   - Category: `computation`
   - Keywords: calculate, math, compute, arithmetic, equation

4. **Statistics** (`statistics`)
   - Statistical analysis of datasets
   - Category: `computation`
   - Keywords: statistics, mean, median, average, data, analysis

### Usage Examples

#### Basic Chat

```bash
curl -X POST http://localhost:3000/llm/chat \
  -H "Content-Type: application/json" \
  -d '{"userPrompt": "Hello, how are you?"}'
```

#### Advanced Research

```bash
curl -X POST http://localhost:3000/llm/advanced-research \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is quantum computing and calculate 2^8",
    "options": {
      "useParallel": true,
      "maxTools": 3,
      "includeAnalysis": true
    }
  }'
```

#### Multi-Agent Workflow

```bash
curl -X POST http://localhost:3000/llm/multi-agent \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain machine learning trends in 2024"}'
```

#### Get Available Tools

```bash
curl -X GET http://localhost:3000/llm/tools
```

## Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable.

### Required Environment Variables

Create a `.env` file in the Server directory:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/m32-chatbot
OPENAI_API_KEY=your_openai_api_key_here
PERPLEXITY_KEY=your_perplexity_api_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
CLIENT_URL=http://localhost:5173
```

### Google OAuth Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized JavaScript origins and redirect URIs
5. Copy the Client ID to your environment variables

## Project Structure

```text
Server/
├── index.ts              # Main server file with WebSocket support
├── config.ts             # Configuration
├── llmWrapper.ts         # OpenAI LLM configuration
├── agents.ts             # Multi-agent research system
├── websocket.ts          # WebSocket server implementation
├── tools/                # Multi-tool system
│   ├── index.ts         # Tool registry initialization
│   ├── toolRegistry.ts  # Central tool management
│   ├── queryAnalyzer.ts # Intelligent query analysis
│   ├── wikipediaTool.ts # Wikipedia integration
│   └── calculatorTool.ts # Math & statistics tools
├── controller/
│   └── llmController.ts # LLM request handlers
├── routes/
│   ├── api.ts           # API routes with Google OAuth
│   └── llm.ts           # LLM & research routes
├── database/
│   └── connection.ts    # MongoDB connection
├── models/
│   └── User.ts          # User model with Google OAuth fields
├── middleware/
│   └── session.ts       # Session management
├── services/
│   └── googleAuth.ts    # Google OAuth verification service
├── types/
│   └── index.ts         # TypeScript interfaces
├── tsconfig.json         # TypeScript configuration
├── nodemon.json          # Nodemon configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Adding New Routes

1. Create a new route file in the `routes/` directory
2. Import and use it in `index.ts`
3. Follow the existing pattern for consistency

## Key Features Explained

### Intelligent Tool Selection

The system automatically analyzes queries and selects the most appropriate tools:

- **Search queries** → Perplexity + Wikipedia
- **Mathematical queries** → Calculator + Statistics
- **Mixed queries** → Multiple tools in parallel

### Parallel Execution

For complex queries, multiple tools run simultaneously for faster results.

### Caching Layer

API responses are cached for 5 minutes to reduce costs and improve performance.

### Fallback System

If a primary tool fails, the system automatically tries fallback tools.

## Development Guide

### Adding New Tools

1. Create a new tool file in `tools/` directory
2. Implement the `DynamicTool` interface
3. Register the tool in `tools/index.ts` with metadata
4. The tool will be automatically available for selection

### Tool Metadata Structure

```typescript
interface ToolMetadata {
  name: string;
  description: string;
  category: "search" | "knowledge" | "computation" | "analysis";
  priority: number;
  keywords: string[];
  fallbackTools?: string[];
}
```

## Deployment

### Production URLs

- **Server**: `http://3.24.179.4:3000` (AWS EC2)
- **Client**: `https://m32-ai.vercel.app` (Vercel)

### Environment Setup

For production deployment, ensure all environment variables are properly configured:

```env
# Production Environment
NODE_ENV=production
PORT=3000
MONGO_URI=your_production_mongodb_uri
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_KEY=your_perplexity_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLIENT_URL=https://m32-ai.vercel.app
```

## Authentication Flow

1. **Google OAuth**: Users authenticate via Google Sign-In
2. **Token Verification**: Server verifies Google ID tokens
3. **User Management**: Automatic user creation/update in MongoDB
4. **Session Management**: Secure session handling with cleanup
5. **WebSocket Authentication**: Real-time communication with session validation

## WebSocket Events

- **Connection**: Authenticated users connect with session ID
- **Chat Messages**: Real-time chat communication
- **Typing Indicators**: Live typing status updates
- **Disconnection**: Automatic cleanup on user disconnect

## Next Steps

- Add more specialized tools (GitHub search, PDF parser, etc.)
- Implement rate limiting for API endpoints
- Set up comprehensive testing framework
- Add monitoring and logging for production
- Configure automated deployment pipeline
