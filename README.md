# ArtYatra 🎨

A comprehensive full-stack web application that brings India's rich artistic heritage to life through AI-powered image classification, interactive mapping, and cultural exploration.

## 🌟 Key Features

### 🖼️ AI-Powered Art Classification
- **Smart Image Analysis**: Upload artwork images and get instant classification using Google's Gemini AI
- **8 Traditional Indian Art Styles**: Warli, Pochampally Ikat, Thanjavur, Madhubani, Kalamkari, Pattachitra, Gond, and Pichwai
- **Confidence Scoring**: AI provides confidence levels and reasoning for each classification

### 🗺️ Interactive Cultural Mapping
- **Geographical Exploration**: Visualize art styles on an interactive map of India
- **Location-Based Discovery**: See where each art form originates with detailed popups
- **Real-time Geolocation**: Automatic location detection for contextual exploration

### 🔍 Advanced Search & Exploration
- **Category-Based Search**: Browse by specific art styles and cultural categories
- **Geographical Search**: Find art forms within a specified radius of any location within TS & AP
- **Wikipedia Integration**: Automatic image fetching from Wikipedia for rich visual context
- **Regional Focus**: Currently focused on Andhra Pradesh and Telangana art cultures

### 📤 Swecha Corpus Integration
- **Direct Upload**: Contribute classified artwork to the Swecha cultural database
- **Metadata Support**: Comprehensive metadata including location, description, and cultural context
- **Batch Processing**: Support for multiple upload formats and sizes

### 🔐 User Authentication
- **Swecha Integration**: Direct authentication using Swecha accounts via API integration
- **Phone-Based Login**: Secure phone number authentication through Swecha's auth system
- **Protected Routes**: Role-based access control for different application features
- **Session Management**: Persistent login state with secure token storage

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom design system for beautiful UI
- **React Query** for efficient data fetching and caching
- **React Hook Form** for robust form handling
- **Leaflet** for interactive mapping with custom markers
- **Radix UI** for accessible component primitives

### Backend
- **Express.js** with TypeScript for API development
- **In-Memory Storage** with static data (currently - database ready)
- **Multer** for file upload handling with validation
- **Google Gemini AI** for advanced image classification

### Development & Deployment
- **TypeScript** throughout for type safety
- **ESLint** for code quality enforcement
- **PostCSS** for CSS processing
- **Docker** containerization support
- **Vercel/Railway** deployment configurations

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Google Gemini API key
- Modern web browser with ES6+ support

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd ArtYatra
   npm install
   ```

2. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # AI Services (Required)
   GEMINI_API_KEY=your_google_gemini_api_key
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Authentication (Swecha Integration)
   VITE_AUTH_API_BASE=https://api.corpus.swecha.org/api/v1
   VITE_AUTH_MODE=token
   ```

3. **Start Development**
   ```bash
   # Start both frontend and backend with hot reload
   npm run dev
   ```

   Application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🗂️ Project Architecture

```
ArtYatra/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/    # Reusable UI Components
│   │   │   ├── ui/       # Radix-based component library
│   │   │   ├── art-style-card.tsx
│   │   │   ├── file-upload.tsx
│   │   │   ├── india-map.tsx
│   │   │   └── protected-route.tsx
│   │   ├── pages/        # Route Components
│   │   │   ├── home.tsx
│   │   │   ├── login.tsx
│   │   │   ├── map.tsx
│   │   │   ├── search.tsx
│   │   │   └── upload-db.tsx
│   │   ├── contexts/     # React Contexts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/        # Custom Hooks
│   │   ├── lib/          # Utilities & Configurations
│   │   └── index.css     # Global Styles
│   └── index.html        # Entry Point
├── server/               # Express Backend
│   ├── index.ts         # Server Entry & Middleware
│   ├── routes.ts        # API Route Definitions
│   ├── services/        # Business Logic
│   │   └── gemini.ts    # AI Classification Service
│   ├── storage.ts       # In-Memory Data Storage (static data)
│   └── vite.ts          # Vite Integration
├── shared/              # Shared Code
│   └── schema.ts        # Database Schema & Types (for future use)
└── Configuration Files
    ├── package.json     # Dependencies & Scripts
    ├── vite.config.ts   # Vite Configuration
    ├── tailwind.config.ts # Tailwind CSS Configuration
    ├── tsconfig.json    # TypeScript Configuration
    └── drizzle.config.ts # Database Migration Configuration (for future use)
```

## 🔧 API Endpoints

### Art Styles
- `GET /api/artstyles` - Get all art styles with location data (from static memory)
- `GET /api/artstyles/:id` - Get specific art style by ID

### Image Classification
- `POST /api/classify` - Classify uploaded artwork image using AI
- `GET /api/classifications/:artStyleId` - Get classification history

### Swecha Integration
- `POST /api/swecha/upload` - Proxy upload to Swecha Corpus
- `POST /api/swecha/upload/simple` - One-shot upload with chunk processing

## 🎨 Supported Art Styles

The application recognizes and classifies 8 major Indian art traditions using static data:

1. **Warli Art** (Maharashtra) - Tribal geometric patterns
2. **Pochampally Ikat** (Telangana) - Tie-dye textile art
3. **Thanjavur Painting** (Tamil Nadu) - Classical gold foil work
4. **Madhubani Painting** (Bihar) - Vibrant folk art
5. **Kalamkari** (Andhra Pradesh) - Hand-painted textiles
6. **Pattachitra** (Odisha) - Traditional scroll painting
7. **Gond Art** (Madhya Pradesh) - Tribal dot and line patterns
8. **Pichwai Painting** (Rajasthan) - Devotional Krishna art

## 🔍 Regional Focus: Andhra Pradesh & Telangana

The Explorer page (`/search`) is specifically focused on the rich cultural heritage of Andhra Pradesh and Telangana, featuring:

- **Cheriyal Scroll Paintings** (Telangana)
- **Nirmal Paintings** (Telangana) 
- **Kalamkari** (Andhra Pradesh)
- **Pochampally Ikat** (Telangana)
- **Kondapalli Toys** (Andhra Pradesh)
- **Banjara Embroidery** (Both states)
- **Andhra Stone Carving** (Andhra Pradesh)
- **Tholu Bommalata** (Andhra & Telangana)
- And many more regional specialties

## 🧪 Testing & Development

```bash
# Type checking
npm run check

# Development with hot reload
npm run dev

# Production build
npm run build
```

## 📝 Important Notes

### Current Implementation Status
- **Data Storage**: Uses in-memory storage with static data (no database required)
- **Authentication**: Direct Swecha API integration for phone-based authentication
- **File Uploads**: Local processing with 10MB limit
- **AI Integration**: Google Gemini API for image classification
- **Regional Focus**: Explorer functionality currently focused on AP & Telangana art forms

### Database Ready Architecture
The project includes database infrastructure (Drizzle ORM, schema definitions) but currently uses in-memory storage. To enable database functionality:

1. Set up PostgreSQL database
2. Configure `DATABASE_URL` in environment variables
3. Run `npm run db:push` to migrate schema
4. Update storage implementation to use database instead of memory

## 🤝 Contributing

We welcome contributions to ArtYatra! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing advanced image classification capabilities
- **Swecha** for cultural database integration and authentication support
- **Indian Art Communities** for preserving these rich traditions
- **Open Source Contributors** for the tools and libraries that make this possible

## 🔮 Future Roadmap

- [ ] Database integration (PostgreSQL with Drizzle ORM)
- [ ] Mobile app development
- [ ] Additional art style support
- [ ] Advanced AI model training
- [ ] Multi-language support
- [ ] Social sharing features
- [ ] Educational content integration
- [ ] Expand regional coverage beyond AP & Telangana

---

**ArtYatra** - Discovering and preserving India's artistic heritage through technology and innovation. Join us in celebrating the rich tapestry of Indian cultural expressions! 🎨🇮🇳
