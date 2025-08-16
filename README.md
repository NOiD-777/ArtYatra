# ArtYatra 🎨

A full-stack web application that brings Indian art and culture to life through AI-powered image generation and interactive exploration.

## 🌟 Features

- **AI Art Generation**: Create stunning artwork in various Indian art styles using Google's Gemini AI
- **Interactive Map**: Explore India's cultural heritage through an interactive map interface
- **Style Gallery**: Browse and discover traditional Indian art forms like Madhubani, Warli, Pattachitra, and more
- **File Upload**: Upload your own images and transform them into Indian art styles
- **Responsive Design**: Beautiful, mobile-first interface built with modern web technologies

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **React Hook Form** for form handling
- **Framer Motion** for animations
- **Leaflet** for interactive maps

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database management
- **PostgreSQL** with Neon database
- **Multer** for file uploads
- **Google Gemini AI** for image generation

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **PostCSS** for CSS processing

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Neon recommended)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ArtYatra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=your_postgresql_connection_string
   
   # Google Gemini API
   GEMINI_API_KEY=your_google_gemini_api_key
   
   # Server
   PORT=5000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   # Start both frontend and backend
   npm run dev
   ```

   The application will be available at:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📦 Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
```

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Railway Deployment

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Deploy:
   ```bash
   railway login
   railway up
   ```

## 🗂️ Project Structure

```
ArtYatra/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/          # Utilities and configurations
│   └── index.html        # Entry HTML file
├── server/               # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── services/         # Business logic and AI services
│   └── vite.ts          # Vite integration
├── shared/              # Shared types and schemas
└── package.json        # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

### Database Schema

The application uses Drizzle ORM with the following main tables:
- `art_styles` - Indian art style definitions
- `generated_images` - AI-generated artwork metadata
- `user_uploads` - User uploaded images

## 🧪 Testing

```bash
# Run type checking
npm run check

# Run in development mode
npm run dev
```

## 🎯 Usage

1. **Home Page**: Explore featured Indian art styles
2. **Map Page**: Navigate India's cultural regions
3. **Upload**: Transform your images with AI
4. **Gallery**: Browse generated artwork

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for image generation capabilities
- Indian art communities for inspiration
- Open-source contributors and maintainers

## 📞 Support

For support, email support@artyatra.com or join our Discord server.
>>>>>>> ec49cb6 (2nd)
