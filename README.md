# Bajaj Finserv AI Assistant

An intelligent financial chatbot that provides insights on Bajaj Finserv using quarterly earnings call transcripts and historical stock price data. The application leverages AI-powered vector search to answer complex financial questions with context-aware responses.

## 🚀 Features

### Core Capabilities
- **AI-Powered Financial Analysis**: Get intelligent responses to financial questions using Together AI
- **Vector Search**: Semantic search through earnings call transcripts using pgvector
- **Stock Price Analysis**: Historical stock data analysis with date range queries
- **CFO Role Simulation**: AI can act as a CFO to provide investor commentary
- **Table Generation**: Automatic table creation for structured data queries

### Data Sources
- **Earnings Call Transcripts**: Q1-Q4 FY25 PDF transcripts with automatic chunking
- **Historical Stock Data**: CSV files with date and price information
- **Real-time Processing**: Automatic embedding generation and storage

### Technical Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase with pgvector extension
- **AI/ML**: Together AI for embeddings and chat responses
- **File Processing**: PDF.js for transcript parsing, PapaParse for CSV

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Together AI API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_TOGETHER_API_KEY=your_together_ai_api_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Enable the pgvector extension
   - Configure RLS policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Tables

#### `transcript_chunks`
- Stores processed transcript chunks with vector embeddings
- Fields: id, content, embedding, quarter, source_file, created_at

#### `stock_prices`
- Stores historical stock price data
- Fields: date (primary key), open, high, low, close, created_at

#### `user_queries`
- Logs user queries and responses for history
- Fields: id, query, answer, query_type, sources, created_at

### Extensions
- **pgvector**: For vector similarity search on transcript embeddings

## 📁 Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx      # Main chat interface
│   │   ├── DataStats.tsx          # Statistics dashboard
│   │   └── FileUpload.tsx         # File upload component
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client and utilities
│   │   └── fileProcessing.ts     # File processing utilities
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
├── supabase/
│   └── migrations/               # Database migration files
├── public/                       # Static assets
└── package.json                  # Dependencies and scripts
```

## 🎯 Usage

### Uploading Data

#### Earnings Call Transcripts
1. Upload PDF files of quarterly earnings call transcripts
2. Include quarter information in filename (e.g., "Q1-FY25.pdf")
3. Files are automatically chunked and embedded using Together AI
4. Supports all 4 quarterly transcripts

#### Stock Price Data
1. Upload CSV files with columns: Date, Close Price
2. Date format: DD-MMM-YY (e.g., 3-Jan-22)
3. Historical stock price data is parsed and stored
4. Supports date range queries and analysis

### Asking Questions

#### Stock Analysis Examples
- "What was the highest stock price in Jan-24?"
- "Compare Bajaj Finserv from Jan-24 to Mar-24"
- "What was the average stock price in Q1-24?"
- "Show me the lowest stock price last quarter"

#### Business Analysis Examples
- "Tell me about organic traffic of Bajaj Markets"
- "Why is BAGIC facing headwinds in Motor insurance?"
- "What's the rationale of Hero partnership?"
- "Give me table with dates explaining Allianz stake sale"
- "Act as CFO and draft commentary for investor call"

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_TOGETHER_API_KEY` | Together AI API key | Yes |

### API Configuration

#### Together AI
- Used for text embeddings and chat responses
- Supports various models for different use cases
- Handles rate limiting and error responses

#### Supabase
- PostgreSQL database with pgvector extension
- Row Level Security (RLS) enabled
- Real-time subscriptions for live updates

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
1. Connect your repository to Vercel or Netlify
2. Set environment variables in the deployment platform
3. Deploy automatically on push to main branch

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   - Check environment variables are correctly set
   - Verify Supabase project is active
   - Ensure RLS policies are configured

2. **PDF Processing Errors**
   - Ensure PDF files are not corrupted
   - Check file size limits
   - Verify PDF.js worker is properly configured

3. **API Key Errors**
   - Verify Together AI API key is valid
   - Check API key permissions
   - Ensure proper rate limiting

4. **Environment Variables Not Loading**
   - Restart development server after .env changes
   - Check for multiline key splitting
   - Verify .env file is in root directory

### Debug Mode
Enable debug logging by checking browser console for detailed error messages and environment variable status.

## 📊 Performance

- **Vector Search**: Optimized with IVFFlat indexes for fast similarity search
- **File Processing**: Asynchronous processing with progress indicators
- **Caching**: Intelligent caching of embeddings and responses
- **Pagination**: Efficient handling of large datasets

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive configuration
- Input validation and sanitization
- Rate limiting for API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for Bajaj Finserv.

## 🆘 Support

For technical support or questions:
- Check the troubleshooting section
- Review browser console logs
- Verify environment variable configuration
- Ensure all dependencies are properly installed

---

**Powered by Supabase, Together AI, and pgvector for intelligent financial analysis** 