# ArtYatra - Indian Art Style Classification Platform

## Overview

ArtYatra is a full-stack web application that allows users to upload artwork images and classify them into traditional Indian art styles using AI. The platform features an interactive map showing the geographical origins of different art styles, complete with cultural information and visual markers. Users can explore Indian artistic heritage through an intuitive interface that combines machine learning classification with educational content about regional art traditions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, following a component-based architecture with modern UI patterns:

- **Framework**: React 18 with TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

The UI follows a responsive design pattern with dedicated pages for image upload and interactive mapping, ensuring accessibility across desktop and mobile devices.

### Backend Architecture
The backend implements a RESTful API using Express.js with TypeScript:

- **Framework**: Express.js with TypeScript for type-safe server development
- **File Processing**: Multer middleware for handling image uploads with size and type validation
- **API Design**: RESTful endpoints for art style data retrieval and image classification
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development Tools**: Hot reloading with Vite integration for seamless development

### Database Architecture
The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **Database**: PostgreSQL for reliable relational data storage
- **ORM**: Drizzle ORM with migrations for schema management and type-safe queries
- **Schema Design**: Three main entities - users, artStyles, and classifications with proper relationships
- **Connection**: Neon serverless PostgreSQL for scalable cloud database hosting

Key tables include:
- `art_styles`: Stores art style metadata, descriptions, locations, and cultural significance
- `classifications`: Records AI classification results with confidence scores and image data
- `users`: Basic user management for potential future authentication features

### AI Integration
The classification system integrates with Google's Gemini AI for artwork analysis:

- **AI Service**: Google Gemini API for image classification and analysis
- **Classification Logic**: Structured prompts targeting specific Indian art styles (Warli, Madhubani, Thanjavur, etc.)
- **Response Format**: JSON-structured responses with confidence scores and reasoning
- **Image Processing**: Base64 encoding for secure image transmission to AI service

### Interactive Mapping
The map component provides geographic visualization of art styles:

- **Mapping Library**: Leaflet for interactive map functionality
- **Visualization**: Custom markers with color coding for different art styles
- **Interactivity**: Hover states and click interactions for detailed art style information
- **Geographic Data**: Coordinate-based positioning for authentic regional representation

### Component Architecture
The application follows a modular component structure:

- **UI Components**: Reusable shadcn/ui components for consistent interface elements
- **Feature Components**: Specialized components for file upload, map interaction, and art style display
- **Layout Components**: Responsive layouts optimized for different screen sizes
- **Custom Hooks**: Reusable logic for mobile detection and toast notifications

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration for image classification
- **@neondatabase/serverless**: Neon PostgreSQL client for serverless database connections
- **drizzle-orm**: Type-safe ORM for database operations and migrations
- **leaflet**: Interactive mapping library for geographic visualization
- **multer**: File upload handling middleware for Express.js

### UI and Design
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for rapid styling
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library for consistent visual elements

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking and enhanced developer experience
- **eslint**: Code linting and quality assurance
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Data Management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation and type inference
- **wouter**: Lightweight routing solution