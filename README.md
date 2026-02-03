# FisherFans GraphQL API

A GraphQL API for the FisherFans platform built with Apollo Server v4, Prisma ORM, and PostgreSQL.

## Docker Setup (Recommended)

This project uses Docker Compose to run PostgreSQL for the database.
 
 ### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v4.0 or higher)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (included with Node.js)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/fatibelkoudia/fisherfans-api.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Docker Desktop** (if not already running)

4. **Start API + database services**
   ```bash
   npm run docker:up
   ```
   This will start:
   - PostgreSQL 15 on `localhost:5432`
   - GraphQL API on `http://localhost:4000`

5. **Push the database schema (first run only)**
   ```bash
   npx prisma db push
   ```

6. **Seed deterministic team data**
   ```bash
   npx prisma db seed
   ```
   This reset-and-seed command always recreates the same shared dataset.
   The dataset now includes six users, three boats, three trips, two occurrences per recurring trip, three bookings, and three log entries. Run the following SQL probe from inside the database container to double-check the counts:
   ```bash
   docker compose exec postgres psql -U fisherfans_user -d fisherfans -c "SELECT 'users' AS table, count(*) FROM users UNION ALL SELECT 'boats', count(*) FROM boats UNION ALL SELECT 'trips', count(*) FROM trips UNION ALL SELECT 'occurrences', count(*) FROM occurrences UNION ALL SELECT 'bookings', count(*) FROM bookings UNION ALL SELECT 'log_entries', count(*) FROM log_entries;"
   ```

7. **Access your services**
   - **GraphQL API**: `http://localhost:4000` 

### Service Status

| Service | Status | URL | Port |
|---------|--------|-----|------|
| **PostgreSQL** | ✅ Running | `localhost:5432` | 5432 |
| **GraphQL API** | ✅ Running | `http://localhost:4000` | 4000 |

### Quick Verification

#### Test All Services
```bash
# Check Docker services status
docker-compose ps

# Check Docker logs
npm run docker:logs

# Test PostgreSQL connection
docker exec fisherfans-postgres psql -U fisherfans_user -d fisherfans -c "SELECT version();"
```

#### Test GraphQL API
Open `http://localhost:4000` in your browser to access Apollo Server Studio, or test with curl:
```bash
curl -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

### Database Management
 
 #### Prisma Studio (Recommended)
 The easiest way to view and edit your data is using Prisma Studio, which comes with your project.
 
 ```bash
 npm run db:studio
 ```
 Opens at `http://localhost:5555`

### Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `npm run dev` | Start development server with hot reload | Development |
| `npm run build` | Compile TypeScript to JavaScript | Production build |
| `npm run start` | Start compiled production server | Production |
| `npm run docker:up` | Start API + PostgreSQL containers | Local stack |
| `npm run docker:down` | Stop and remove containers | Cleanup |
| `npm run docker:logs` | View real-time container logs | Debugging |
| `npm run db:push` | Push schema changes to database | Schema sync |
| `npm run db:migrate` | Create and apply migrations | Schema versioning |
| `npm run db:seed` | Seed deterministic shared dataset | Team setup |
| `npm run db:studio` | Open Prisma Studio interface | Data management |

### Docker Services Details

#### PostgreSQL Database
- **Container Name**: `fisherfans-postgres`
- **Image**: `postgres:15-alpine` (Lightweight Alpine Linux)
- **Port Mapping**: `5432:5432`
- **Data Persistence**: Docker volume `postgres_data`
- **Network**: `fisherfans-network` (custom bridge)

### Project Structure

```
fisherfans-api/
├── src/
│   ├── graphql/
│   │   ├── resolvers.ts      # GraphQL resolvers implementation
│   │   └── schema.ts         # GraphQL type definitions
│   ├── context.ts            # Context interface for Apollo Server
│   └── index.ts              # Apollo Server setup & startup
├── prisma/
│   ├── migrations/           # Database migrations
│   └── schema.prisma         # Database schema & models
├── docker-compose.yml        # Multi-container Docker setup
├── prisma.config.ts          # Prisma configuration
├── .env                      # Environment variables
├── .dockerignore             # Docker build exclusions
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies & scripts
```

###  Technology Stack

- **Runtime**: Node.js v18+
- **Language**: TypeScript
- **GraphQL Server**: Apollo Server v4 (Standalone)
- **Database**: PostgreSQL 15 (Alpine)
- **ORM**: Prisma v6
- **Database UI**: Prisma Studio
- **Containerization**: Docker & Docker Compose

### 🔧 Troubleshooting

#### Port Conflicts
If you get "port already in use" errors:
```bash
# Check which process is using the port
lsof -i :4000  # or :5432, :8080
kill -9 <PID>  # Replace <PID> with the process ID

# Or change ports in docker-compose.yml
```
