# URL Shortener

A fast, lightweight URL shortener built with modern TypeScript and web technologies. Features include TTL-based URL expiration, visit tracking, and a clean API.

## ✨ Features

- **🔗 URL Shortening** — Generate short, unique codes for any URL
- **⏰ TTL Support** — Optional expiration time for shortened URLs
- **📊 Visit Tracking** — Track how many times each short URL is accessed
- **🚀 Fast** — Built with Hono, one of the fastest web frameworks
- **🗄️ SQLite** — Zero-config database with Prisma ORM
- **🧪 Tested** — Comprehensive E2E tests with Vitest

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 24 |
| Framework | [Hono](https://hono.dev) |
| Database | SQLite + [Prisma](https://prisma.io) |
| Language | TypeScript |
| Testing | Vitest |
| Linting | Biome |

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/KleitonBarone/url-shortener.git
cd url-shortener

# Use correct Node version
nvm use

# Install dependencies (automatically generates Prisma client)
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npm run db:migrate
```

## 🚀 Usage

### Development

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Production

```bash
npm run build
npm run start
```

## 📡 API Endpoints

### Create Short URL

```http
POST /shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "ttl": 3600  // Optional: expires in 1 hour (seconds)
}
```

**Response:**
```json
{
  "shortUrl": "http://localhost:3000/xK9mPq",
  "shortCode": "xK9mPq",
  "expiresAt": "2025-12-06T21:00:00.000Z"
}
```

### Access Short URL

```http
GET /:shortCode
```

Redirects (302) to the original URL, or returns 404 if not found/expired.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check for lint errors |
| `npm run lint:fix` | Fix lint errors automatically |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:push` | Push schema changes (no migration) |
| `npm run db:reset` | Reset database |
| `npm run db:studio` | Open Prisma Studio GUI |

## 📁 Project Structure

```
url-shortener/
├── src/
│   ├── config/         # Configuration settings
│   ├── lib/            # Prisma client
│   ├── routes/         # API route handlers
│   │   ├── index.ts    # Route aggregator
│   │   ├── shorten.ts  # POST /shorten
│   │   └── redirect.ts # GET /:shortCode
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── tests/
│   ├── e2e.test.ts     # End-to-end tests
│   ├── helpers.ts      # Test utilities
│   └── setup.ts        # Test configuration
└── generated/          # Prisma generated client (gitignored)
```

## 🔧 Configuration

Create a `.env` file with the following:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
```

## 📈 Capacity

The default 6-character short codes using alphanumeric characters (62 chars) provide:

**62^6 = 56,800,235,584 possible combinations (~56.8 billion unique URLs)**

## 📄 License

[MIT](LICENSE) © Kleiton Barone
