# M32 Chatbot Server

A production-ready Express.js server with advanced multi-tool research capabilities using LangChain.

## Features

- 🚀 Express.js 5.x with modern middleware
- 🔒 Security headers with Helmet
- 🌐 CORS enabled
- 📝 Request logging with Morgan
- 🛡️ Error handling middleware
- 🔍 Health check endpoint
- 📁 Organized route structure
- 🗄️ MongoDB integration with Mongoose
- 👥 User management with validation
- 📘 TypeScript support with strict typing
- 🤖 **Multi-Agent Research System** with LangChain
- 🔧 **Intelligent Tool Selection** and parallel execution
- 🌐 **Web Search** via Perplexity AI
- 📚 **Wikipedia Integration** for knowledge retrieval
- 🧮 **Calculator & Statistics** tools
- ⚡ **Caching Layer** for optimized performance
- 🔄 **Fallback Mechanisms** for robust operation

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

- `GET /api/status` - API status
- `GET /api/users` - Get users
- `POST /api/signup` - User registration (email & password)
- `POST /api/signin` - User authentication (email & password)

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
```

## Project Structure

```
Server/
├── index.ts              # Main server file
├── config.ts             # Configuration
├── llmWrapper.ts         # OpenAI LLM configuration
├── agents.ts             # Multi-agent research system
├── tools/                # Multi-tool system
│   ├── index.ts         # Tool registry initialization
│   ├── toolRegistry.ts  # Central tool management
│   ├── queryAnalyzer.ts # Intelligent query analysis
│   ├── wikipediaTool.ts # Wikipedia integration
│   └── calculatorTool.ts # Math & statistics tools
├── controller/
│   └── llmController.ts # LLM request handlers
├── routes/
│   ├── api.ts           # API routes
│   └── llm.ts           # LLM & research routes
├── database/
│   └── connection.ts    # MongoDB connection
├── models/
│   └── User.ts          # User model
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

## Development

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

## Next Steps

- Add more specialized tools (GitHub search, PDF parser, etc.)
- Implement user authentication for tool usage tracking
- Add rate limiting for API endpoints
- Set up comprehensive testing framework
- Configure production deployment with Docker
