# Doclytics AI Server

AI-powered document analysis backend built with NestJS. Upload documents (images/PDFs), extract text via OCR, and interact with them using Google Gemini AI.

## Features

- **Document Upload**: Support for JPG, PNG, and PDF files (max 10MB)
- **OCR Processing**: Automated text extraction using Tesseract.js
- **AI Interactions**: Ask questions about your documents using Google Gemini
- **Cloud Storage**: File management via Cloudinary
- **User Authentication**: JWT-based authentication

## Tech Stack

- NestJS
- PostgreSQL + Prisma ORM
- Google Gemini AI
- Tesseract.js (OCR)
- Cloudinary (storage)

## Local Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Cloudinary account
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd doclytics-ai-server
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Set up the database
```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server
```bash
npm run start:dev
```

The server will run on `http://localhost:3333`

## API Endpoints

- `POST /users/register` - Register new user
- `POST /users/login` - Login
- `POST /documents/upload` - Upload document
- `GET /documents` - List user documents
- `POST /documents/:id/interactions/ask` - Ask AI about document
- `GET /documents/:id/download` - Download annotated document
