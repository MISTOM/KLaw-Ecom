# Ecommerce
Platform for selling and purchasing publications for kenyalaw.
## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v20 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) for database management

### Installation

Clone this repository and install dependencies:

```bash
git clone [https:// ...kenyalawecommerce]
cd kenyalawecommerce
npm install
```

Setup your environment variables:

1. Create a `.env` file in the root directory
2. Add your database connection string and secret keys

```bash
DATABASE_URL="postgresql://user:password@host/[database-name]?schema=public"
SECRET_KEY="secret"
REFRESH_KEY="refreshkey"
RESET_KEY="reset
```

Ensure to grant `user` all privileges to `[database-name]`
```sql
GRANT ALL PRIVILEGES ON DATABASE [database-name] TO [user];
```


Run migrations, seed and sync database tables based on Prisma schema models [(prisma.schema)](/prisma/schema.prisma)

```bash
npx prisma migrate dev && npx prisma db seed && npx prisma generate

#use `npx prisma migrate deploy` in production
```

### Development

Run the app in dev mode with:

```bash
npm run dev
```

Access prisma studio to interact with the data directly

```bash
npx prisma studio
```

### Building

To create a production build and preview:

```bash
npm run build
npm run preview
```