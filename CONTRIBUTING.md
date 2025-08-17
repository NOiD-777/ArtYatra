# Contributors 👩‍🎨👨‍🎨

This project is a collaborative effort to build **ArtYatra**, a full-stack web application for exploring Indian art styles interactively.  

We welcome contributions from anyone interested in improving the project — from frontend design and backend APIs to AI integration and database management.

---

## Core Contributors

| Name           | Role / Contribution                                  | Contact / GitHub                       |
|----------------|------------------------------------------------------|----------------------------------------|
| Arushi         | Frontend development, React + Tailwind CSS           | [GitHub](https://github.com/arushimathur2604)   |
| Akash D.       | Full-stack development, backend Node.js/Express      | [GitHub](https://github.com/akash-cse-projects-05)  |
| Abhinay        | Database schema & sample data                        | [GitHub](https://github.com/NOiD-777)  |
| Vishesh Chawan | Gemini API integration & image classification        | [GitHub](https://github.com/visheshchawan) |

---

## How to Contribute

1. **Fork the repository** and clone it locally.
2. **Create a branch** for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. **Make your changes** and test them thoroughly.
4. **Commit your changes** with a clear, descriptive message:
   ```bash
   git commit -m "Add: brief description of changes"
   ```
5. **Push to your fork** and create a Pull Request:
   ```bash
   git push origin feature-name
   ```
6. **Fill out the PR template** with details about your changes.

---

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for database)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ArtYatra.git
   cd ArtYatra
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

---

## Project Structure

```
ArtYatra/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
├── server/          # Node.js backend
│   ├── services/
│   ├── routes.ts
│   └── index.ts
├── shared/          # Shared types and schemas
└── CONTRIBUTING.md
```

---

## Code Guidelines

### Frontend (React/TypeScript)
- Use functional components with hooks
- Follow the existing component structure
- Use Tailwind CSS for styling
- Ensure responsive design

### Backend (Node.js/Express)
- Use TypeScript for all server code
- Follow RESTful API conventions
- Include proper error handling
- Add appropriate logging

### Database
- Use Drizzle ORM for database operations
- Follow the existing schema patterns
- Include migrations for schema changes

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
2. Address all feedback before merging
3. Ensure CI checks pass
4. Keep PRs focused and small when possible

---

## Questions?

Feel free to:
- Open an issue for questions
- Join our discussions
- Reach out to core contributors

Thank you for contributing to ArtYatra! 🎨
