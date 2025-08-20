# Express Server

A production-ready Express.js server for the m32-chatbot project.

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

## Installation

1. Install dependencies:

```bash
npm install
```

2. For development, install nodemon globally:

```bash
npm install -g nodemon
```

## Usage

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

### API Routes

- `GET /api/status` - API status
- `GET /api/users` - Get users
- `POST /api/signup` - User registration (email & password)
- `POST /api/signin` - User authentication (email & password)

## Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Project Structure

```
Server/
├── index.ts              # Main server file
├── config.ts             # Configuration
├── types/
│   └── index.ts         # TypeScript interfaces
├── database/
│   └── connection.ts    # MongoDB connection
├── models/
│   └── User.ts          # User model
├── routes/
│   └── api.ts           # API routes
├── tsconfig.json         # TypeScript configuration
├── nodemon.json          # Nodemon configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Adding New Routes

1. Create a new route file in the `routes/` directory
2. Import and use it in `index.ts`
3. Follow the existing pattern for consistency

## Environment Variables

Create a `.env` file in the Server directory with:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/chatbot
```

**Note:** Replace the MONGO_URI with your actual MongoDB connection string.

## Next Steps

- Add database connection (MongoDB, PostgreSQL, etc.)
- Implement authentication middleware
- Add input validation
- Set up testing framework
- Configure production deployment
