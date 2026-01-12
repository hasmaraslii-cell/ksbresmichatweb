# Ak Sangur - Cyber Headquarters Portal

## Overview

This is a "Cyber Headquarters" themed web application for a gaming clan/organization called "Ak Sangur". It features a dark, industrial UI aesthetic with a bento-box layout design. The application provides user authentication, real-time chat functionality, and an admin panel for user/message management.

The tech stack is a full-stack TypeScript monorepo with React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom dark theme (petrol blue/charcoal palette)
- **UI Components**: shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for complex UI animations
- **Build Tool**: Vite

The frontend follows a pages-based structure with reusable components. Custom hooks (`use-auth`, `use-chat`, `use-users`) encapsulate API interactions and state management.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with Local Strategy, session-based auth using MemoryStore
- **Password Hashing**: Node.js crypto scrypt
- **API Design**: REST endpoints defined in shared routes file with Zod validation schemas

The backend serves both the API and static files in production. Development uses Vite's middleware mode for HMR.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema**: Two main tables - `users` and `messages` with relations
- **Migrations**: Managed via `drizzle-kit push`

### Shared Code
The `shared/` directory contains:
- Database schema definitions (`schema.ts`)
- API route definitions with Zod validation (`routes.ts`)

This pattern ensures type safety across frontend and backend.

### Key Design Patterns
- **Type-safe API contracts**: Routes defined once in shared code, validated with Zod
- **Soft deletes**: Both users and messages use `isDeleted` flags
- **Role-based access**: Admin vs user roles control access to management features
- **Polling for real-time**: Chat uses 3-second polling (no WebSocket currently)

## External Dependencies

### Database
- **PostgreSQL**: Required, connection via `DATABASE_URL` environment variable

### Third-Party Services
- **Firebase**: Client-side Firebase SDK is initialized but appears unused (legacy code in `client/src/lib/firebase.ts`)
- **DiceBear API**: Used for generating default avatar URLs

### Key npm Packages
- **UI**: Radix UI primitives, Lucide icons, class-variance-authority
- **Forms**: React Hook Form with Zod resolver
- **Date handling**: date-fns
- **Session storage**: connect-pg-simple (available but currently using memorystore)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Optional, defaults to hardcoded value (should be set in production)