# TraceGuard AI - Image Protection Platform

An AI-powered platform that protects digital images before misuse by embedding invisible watermark data and generating unique fingerprints, then detects duplicate or reused images and alerts the user.

## Features

### Core Features
- **User Authentication System**: Sign up, Login, Logout with secure session management
- **Image Upload & Protection**: Upload images (JPG/PNG/WebP) and protect with invisible watermarks
- **Content Fingerprinting**: Generate unique hash for each image using perceptual-like hashing
- **Detection System**: Compare images against database to detect duplicates
- **User Dashboard**: View uploaded images, protection status, and fingerprints
- **Alert & Notification System**: Real-time alerts for detected duplicates

### Extra Features
- **Content ID**: Unique identifier for each protected image
- **Ownership Certificate**: Generated certificate for protected content
- **Loading Animations**: Smooth progress indicators during processing
- **PWA Support**: Progressive Web App with mobile responsiveness

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Animations**: Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite
- **Authentication**: Custom session-based auth with secure cookies

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── logo.png               # Application logo
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication routes
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   ├── me/
│   │   │   │   └── register/
│   │   │   ├── alerts/        # Alert management
│   │   │   └── images/        # Image operations
│   │   │       ├── detect/    # Duplicate detection
│   │   │       ├── protect/   # Watermark embedding
│   │   │       ├── upload/    # Image upload
│   │   │       ├── user/      # User's images
│   │   │       └── [id]/      # Single image operations
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main application
│   ├── components/ui/         # shadcn/ui components
│   ├── hooks/                 # Custom hooks
│   └── lib/
│       ├── auth.ts            # Authentication utilities
│       ├── db.ts              # Database client
│       ├── fingerprint.ts     # Fingerprinting logic
│       └── utils.ts           # Utility functions
└── uploads/                   # Uploaded images storage
```

## How to Run Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd traceguard-ai
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up the database**
   ```bash
   bun run db:push
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Images
- `POST /api/images/upload` - Upload new image
- `POST /api/images/protect` - Protect image with watermark
- `POST /api/images/detect` - Detect duplicates
- `GET /api/images/user` - Get user's images
- `GET /api/images/[id]` - Get single image
- `DELETE /api/images/[id]` - Delete image

### Alerts
- `GET /api/alerts` - Get user alerts
- `PUT /api/alerts` - Mark alerts as read

## Features Explained

### Image Fingerprinting
The system generates a unique hash for each image using:
- File content sampling (first 8KB, middle 4KB, last 4KB)
- File size integration
- SHA-256 hashing algorithm

### Duplicate Detection
Compares uploaded images against the database using:
- Hash similarity calculation (character-by-character comparison)
- Configurable threshold (default: 95%)
- Exact and approximate match detection

### Watermark Simulation
For MVP purposes, watermark embedding is simulated:
- Records watermark metadata in database
- Generates ownership certificate
- In production, would use steganography or invisible watermark libraries

### Security
- Password hashing with SHA-256 + salt
- Session-based authentication with secure HTTP-only cookies
- File type validation (JPG, PNG, WebP only)
- File size limit (10MB max)

## Environment Variables

Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./db/custom.db"
NODE_ENV="development"
```

## PWA Features

The application is PWA-ready with:
- Installable on mobile devices
- Offline-capable (with service worker)
- App-like experience
- Push notification ready (requires additional setup)

## License

MIT License

---

Built with ❤️ using Next.js, Tailwind CSS, and shadcn/ui
