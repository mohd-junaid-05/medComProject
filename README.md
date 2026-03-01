# MedComm – Medical Communication Platform

AI-powered medical image generation platform for healthcare professionals. Built with Node.js, Express, PostgreSQL, and Prisma.

---

## Tech Stack

- **Frontend**: Plain HTML, Custom CSS, Vanilla JavaScript (ES Modules)
- **Backend**: Node.js, Express, ES Modules, MVC Architecture
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **AI**: OpenAI DALL-E 3

---

## Prerequisites

- Node.js v18+
- PostgreSQL installed and running
- OpenAI API key

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd medcomm
```

### 2. Install dependencies

```bash
cd server
npm install
```

### 3. PostgreSQL Setup

Open psql and create the database:

```sql
CREATE DATABASE medcomm;
CREATE USER medcomm_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE medcomm TO medcomm_user;
```

### 4. Environment Variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://medcomm_user:yourpassword@localhost:5432/medcomm"
JWT_SECRET="your_super_secret_jwt_key_here"
OPENAI_API_KEY="sk-your-openai-key-here"
```

### 5. Prisma Migration

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Run the app

```bash
# From the server directory
npm run dev
```

Open: [http://localhost:5000](http://localhost:5000)

---

## Project Structure

```
medcomm/
├── client/               # Frontend (served by Express)
│   ├── css/styles.css
│   ├── js/
│   │   ├── config.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── generate.js
│   │   └── stock.js
│   └── pages/
│       ├── index.html
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html
│       └── stock.html
└── server/
    ├── prisma/schema.prisma
    └── src/
        ├── config/prismaClient.js
        ├── controllers/
        ├── middleware/
        ├── routes/
        └── server.js
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register doctor |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/profile | Yes | Get profile |
| POST | /api/images/generate | Yes | Generate image |
| GET | /api/images/my-images | Yes | Get my images |
| DELETE | /api/images/:id | Yes | Delete image |
| GET | /api/images/stock | Yes | Browse all images |

---

## Deployment to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Root Directory** to `server`
5. **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
6. **Start Command**: `npm start`
7. Add environment variables in Render dashboard:
   - `DATABASE_URL` (use Render PostgreSQL or external)
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `PORT` (Render sets this automatically)
8. For static files, add a **Static Site** pointing to the `client` folder, or configure Express to serve it (already set up)

---

## License

MIT
