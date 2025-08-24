# Contributors 👩‍🎨👨‍🎨

This project is a collaborative effort to build **ArtYatra**, a full-stack web application that brings India's rich artistic heritage to life through **AI-powered image classification**, **interactive mapping**, and **cultural exploration**.  

While contributions are welcome from anyone, **Abhinay** led the development of this project, making key contributions in **frontend UI (React + Tailwind CSS)** and **Swecha API integration**.

---

## Core Contributors

| Name           | Role / Contribution                                  | Contact / GitHub                       |
|----------------|------------------------------------------------------|----------------------------------------|
| **Abhinay**    | Lead developer, frontend UI (React + Tailwind CSS), Swecha API integration | [GitHub](https://github.com/NOiD-777) |
| Arushi         | Assisted in frontend UI design, reusable React components, interactive mapping UI | [GitHub](https://github.com/arushimathur2604) |
| Akash D.       | Backend route handling, server logic, file upload management | [GitHub](https://github.com/akash-cse-projects-05) |
| Vishesh Chawan | AI image classification integration (Google Gemini API), model reasoning & confidence scoring | [GitHub](https://github.com/visheshchawan) |

---

## How to Contribute

1. **Fork the repository** and clone it locally:
   ```bash
   git clone <repository-url>
   cd ArtYatra
   ```
2. **Create a branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Make your changes** and test them thoroughly.
4. **Commit your changes** with a clear, descriptive message:
   ```bash
   git commit -m "Add: brief description of changes"
   ```
5. **Push to your fork** and create a Pull Request:
   ```bash
   git push origin feature/your-feature
   ```
6. **Fill out the PR template** with details about your changes.

---

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key (for AI integration)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and server configuration
   ```
3. **Start development server**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173  
   - Backend API: http://localhost:5000  

---

## Project Structure

```
ArtYatra/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/    # Reusable UI Components
│   │   ├── pages/         # Route Components
│   │   ├── contexts/      # React Contexts
│   │   ├── hooks/         # Custom Hooks
│   │   ├── lib/           # Utilities & Configs
│   │   └── index.css       # Global Styles
├── server/                 # Express Backend
│   ├── index.ts           # Server Entry & Middleware
│   ├── routes.ts          # API Route Definitions
│   ├── services/          # Business Logic
│   ├── storage.ts         # In-Memory Storage (static data)
│   └── vite.ts            # Vite Integration
├── shared/                # Shared Code (types & schemas)
└── Configuration Files
```

---

## Code Guidelines

### Frontend (React/TypeScript)
- Use functional components with hooks
- Follow the existing component and page structure
- Use Tailwind CSS for consistent styling
- Ensure responsive and accessible design

### Backend (Node.js/Express)
- Use TypeScript for all server code
- Follow RESTful API conventions
- Include proper error handling and logging
- Handle file uploads and API requests securely

---

## Reporting Issues

If you find a bug or have a feature request:

1. Check existing issues first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable

---

## Code Review Process

1. All PRs require at least one review
2. Address feedback before merging
3. Ensure CI checks pass
4. Keep PRs focused and concise

---

## Questions

- Open an issue for questions or discussions  
- Reach out to core contributors  

Thank you for contributing to **ArtYatra**! 🎨
