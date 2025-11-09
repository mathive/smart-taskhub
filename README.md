# Smart TaskHub

A modern full-stack task management application built with Angular 17, NestJS, Prisma, and PostgreSQL.

## 🚀 Features

- **Authentication**
  - JWT-based authentication
  - OAuth integration (Google & GitHub)
  - Secure password hashing with bcrypt
  - Route guards for protected pages

- **Projects & Tasks** (Coming Soon)
  - Create, read, update, delete projects
  - Task management with status tracking
  - Priority levels and due dates

- **Dashboard** (Coming Soon)
  - Analytics and charts
  - Task progress visualization
  - Project insights

- **AI Integration** (Coming Soon)
  - AI-powered task suggestions using Gemini API
  - Automated task descriptions

## 🛠️ Tech Stack

### Frontend
- Angular 17 (Standalone Components)
- Angular Material
- Tailwind CSS
- RxJS
- TypeScript

### Backend
- NestJS
- Prisma ORM
- SQLite (Development) / PostgreSQL (Production)
- Passport.js (JWT, Google, GitHub)
- TypeScript

## 📦 Installation

### Prerequisites
- Node.js (LTS version)
- npm or yarn
- Git

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/smart-taskhub.git
cd smart-taskhub
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:4200"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

Run migrations:
```bash
npx prisma migrate dev
npm run start:dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
ng serve
```

## 🔧 Development

### Run Backend (Port 3000)
```bash
cd backend
npm run start:dev
```

### Run Frontend (Port 4200)
```bash
cd frontend
ng serve
```

Visit `http://localhost:4200`

## 📝 Project Structure

```
smart-taskhub/
├── frontend/          # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── services/
│   │   │   └── shared/
│   └── package.json
├── backend/           # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── prisma/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── README.md
```

## 🚧 Roadmap

- [x] Week 1-2: Setup & Authentication
- [ ] Week 3: Projects & Tasks CRUD
- [ ] Week 4: Dashboard & Analytics
- [ ] Week 5: AI Integration
- [ ] Week 6: Realtime Updates
- [ ] Week 7: Docker & CI/CD
- [ ] Week 8: Final Polish & Deployment

## 📄 License

MIT

## 👤 Author

Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
