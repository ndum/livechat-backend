# Live Chat Backend

A modern, scalable live chat backend built with TypeScript, Express, Prisma, and MongoDB. Features real-time communication via WebSockets, JWT authentication, and comprehensive API documentation.

> This project was primarily created for the "WEB I" course at HF-Informatik.

## Features

- **Real-time Communication**: WebSocket support for instant message delivery
- **Secure Authentication**: JWT-based authentication with password hashing
- **Type-Safe**: Full TypeScript implementation with Prisma ORM
- **Clean Architecture**: Layered architecture (Controllers > Services > Repositories)
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Comprehensive Testing**: Full test coverage with Vitest
- **Security**: Rate limiting, helmet.js, input validation with Zod
- **Database**: MongoDB with Prisma ORM

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (with replica set support)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Testing**: Vitest + Supertest
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino
- **WebSockets**: ws (WebSocket library)
- **Code Quality**: ESLint + Prettier

## Prerequisites

- Node.js >= 22
- MongoDB >= 7.0 (configured as replica set)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd livechat-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration (see Environment Variables section below).

4. Set up MongoDB replica set (required for Prisma transactions):

**Windows:**
- Edit `mongod.cfg` (usually in `C:\Program Files\MongoDB\Server\<version>\bin\`)
- Add:
  ```yaml
  replication:
    replSetName: "rs0"
  ```
- Restart MongoDB service
- Initialize replica set:
  ```bash
  mongosh
  rs.initiate()
  ```

**Linux/Mac:**
- Add to your MongoDB config:
  ```yaml
  replication:
    replSetName: "rs0"
  ```
- Restart MongoDB
- Initialize: `mongosh` then `rs.initiate()`

5. Generate Prisma client:
```bash
npx prisma generate
```

6. (Optional) Seed the database:
```bash
npm run seed
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
URL=http://localhost
BEHIND_PROXY=false

# Database
DATABASE_URL=mongodb://localhost:27017/livechat

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Docker
DOCKER=false
```

**Important**: Set `BEHIND_PROXY=true` if running behind a reverse proxy (nginx, Apache, etc.)

## Running the Application

### Development Mode
```bash
npm run dev
```

Server will start at `http://localhost:3000`

### Production Mode
```bash
npm run build
npm start
```

## Reverse Proxy Configuration

When running behind a reverse proxy (e.g., nginx, Apache), ensure WebSocket support is enabled.

### Example nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Important**: Set `BEHIND_PROXY=true` in your `.env` file when using a reverse proxy.

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

## API Documentation

Once the server is running, access the interactive Swagger documentation at:

```
http://localhost:3000/api/docs
```

### API Endpoints

**Authentication:**
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and receive JWT token
- `POST /api/v1/auth/logout` - Logout user

**Users:**
- `GET /api/v1/users` - Get all users (public)
- `GET /api/v1/users/:id` - Get user by ID (public)
- `PUT /api/v1/users/:id` - Update user profile (authenticated, own profile only)
- `DELETE /api/v1/users/:id` - Delete user account (authenticated, own account only)

**Chat Messages:**
- `GET /api/v1/messages` - Get all messages (public)
- `GET /api/v1/messages/:id` - Get message by ID (public)
- `POST /api/v1/messages` - Create new message (authenticated)
- `PUT /api/v1/messages/:id` - Update message (authenticated, own message only)
- `DELETE /api/v1/messages/:id` - Delete message (authenticated, own message only)

### WebSocket Events

Connect to WebSocket at `ws://localhost:3000`

**Events broadcast to all clients:**
- `new_login` - User logged in
- `new_message` - New chat message created
- `changed_message` - Message updated
- `deleted_message` - Message deleted
- `changed_user` - User profile updated
- `deleted_user` - User account deleted
- `new_logout` - User logged out

## Project Structure

```
livechat-backend/
├── prisma/
│   └── schema.prisma          # Prisma database schema
├── src/
│   ├── config/                # Configuration files
│   │   ├── env.ts            # Environment validation
│   │   ├── logger.ts         # Pino logger setup
│   │   └── swagger.ts        # Swagger/OpenAPI config
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   └── user.controller.ts
│   ├── infrastructure/        # External services
│   │   ├── database.ts       # Prisma client singleton
│   │   └── websocket.ts      # WebSocket server setup
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # JWT authentication
│   │   ├── errorHandler.ts   # Global error handler
│   │   └── validate.ts       # Zod validation middleware
│   ├── repositories/          # Data access layer
│   │   ├── chatMessage.repository.ts
│   │   └── user.repository.ts
│   ├── routes/                # API routes
│   │   └── v1/
│   │       ├── index.ts
│   │       ├── auth.routes.ts
│   │       ├── chat.routes.ts
│   │       └── user.routes.ts
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   └── user.service.ts
│   ├── tests/                 # Test files
│   │   ├── setup.ts
│   │   ├── helpers.ts
│   │   ├── auth.test.ts
│   │   ├── chat.test.ts
│   │   └── user.test.ts
│   ├── utils/                 # Utility functions
│   │   └── errors.ts         # Custom error classes
│   ├── validators/            # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── chat.validator.ts
│   │   └── user.validator.ts
│   └── server.ts             # Application entry point
├── .env.example              # Environment variables template
├── package.json
├── tsconfig.json
└── vitest.config.ts          # Test configuration
```

## Architecture

This project follows clean architecture principles with clear separation of concerns:

1. **Controllers**: Handle HTTP requests/responses, delegate to services
2. **Services**: Contain business logic, orchestrate repositories
3. **Repositories**: Data access layer, interact with database via Prisma
4. **Validators**: Input validation using Zod schemas
5. **Middleware**: Cross-cutting concerns (auth, validation, error handling)

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication (1-hour expiration)
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Zod schemas validate all inputs
- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Ownership Validation**: Users can only modify their own resources

## Development

### Available Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm start                # Start production server
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
npm run lint             # Check code with ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run typecheck        # Type check with TypeScript
```

### Database Commands

View database in Prisma Studio:
```bash
npx prisma studio
```

Create a new migration:
```bash
npx prisma migrate dev --name migration-name
```

Reset database:
```bash
npx prisma migrate reset
```

### Docker

Build and run with Docker:
```bash
docker build -t livechat-backend .
docker run -p 3000:3000 -e DATABASE_URL="mongodb://host:27017/livechat" livechat-backend
```

Or use Docker Compose:
```bash
docker-compose up --build
```

### Code Quality

The codebase follows these principles:
- Self-documenting code with clear naming
- JSDoc comments for public APIs
- Minimal comments (explain "why", not "what")
- TypeScript strict mode
- Comprehensive error handling
- Full test coverage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Nicolas Dumermuth

## Support

For issues and questions, please open an issue in the GitHub repository.
