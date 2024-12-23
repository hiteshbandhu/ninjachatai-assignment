# Document Chat Application

A Next.js application that allows users to upload PDF documents, manage them, and engage in AI-powered conversations about their content.

## Features

- PDF file upload with drag-and-drop support
- Document management system
- Real-time chat interface with AI
- Document embedding and indexing
- SQLite database for file tracking
- Pinecone vector database integration
- Markdown rendering in chat
- Responsive design

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (file tracking), Pinecone (vector database)
- **AI**: OpenAI GPT-4, LangChain, Vercel AI SDK
- **File Processing**: PDF parsing and chunking
- **Styling**: TailwindCSS, Lucide Icons

## Prerequisites

- Node.js (v14 or later)
- pnpm or npm
- OpenAI API key
- Pinecone API key and index

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/hiteshbandhu/ninjachatai-assignment.git
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Run the development server:
```bash
pnpm run dev
# or
npm run dev
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── chat/           # Chat interface
│   └── page.tsx        # Home page
├── components/         # React components
├── utils/             # Utility functions
│   ├── db/            # Database utilities
│   └── pinecone/      # Pinecone integration
```

## Key Features

### Document Upload
- Supports PDF files
- Progress tracking
- Duplicate file detection
- File size limit enforcement

### Document Management
- List view of uploaded documents
- Last accessed timestamps
- Quick access to chat interface
- File organization

### Chat Interface
- Real-time AI responses
- Markdown rendering
- Tool integration
- Context-aware responses

## API Endpoints

- `POST /api/fileHandler/saveToServer` - Upload files
- `POST /api/fileHandler/embedFilesAndIndex` - Process and index files
- `GET /api/dbEntries/fetch` - Get file list
- `POST /api/dbEntries/updateTimestamp` - Update file access time
- `POST /api/chat` - Handle chat interactions
- Use the `text-embedding-3-small` model for embeddings in the pinecone index

## File Tracker Database Schema

```sql
CREATE TABLE "FILE_TRACKER" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    filename TEXT NOT NULL,
    namespace TEXT NOT NULL
)
```
