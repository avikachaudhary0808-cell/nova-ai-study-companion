# AI Study Companion

A full-stack MERN application built with React (Vite), Node.js, Express, and MongoDB.

## Features
- User authentication (JWT)
- Study material management
- AI-powered flashcard generation
- Progress tracking
- Clean, scalable architecture

## Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS
- React Router v6
- Axios
- React Query (TanStack Query)
- Zustand (State Management)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- dotenv for environment variables
- CORS enabled

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. Clone the repository
2. Install dependencies for both client and server:
   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install
   ```
3. Configure environment variables:
   ```bash
   # server/.env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai-study-companion
   JWT_SECRET=your_jwt_secret_here
   
   # client/.env
   VITE_API_URL=http://localhost:5000
   ```
4. Run the application:
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev

   # Terminal 2 - Start client
   cd client
   npm run dev
   ```

## Project Structure

```
AI-Study-Companion/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── contexts/
│   │   └── styles/
│   ├── index.html
│   └── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
└── README.md
```

## License

MIT
