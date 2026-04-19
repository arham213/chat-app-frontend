# chat-app-frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white&style=flat-square)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white&style=flat-square)

Frontend for a real-time chat system built with React and Socket.IO. Manages WebSocket lifecycle, presence state, and media sharing alongside a persistent message history.

**Live:** [chat-app-frontend-beta-three.vercel.app](https://chat-app-frontend-beta-three.vercel.app) &nbsp;|&nbsp; **Backend:** [chat-app-backend-dummy.up.railway.app](https://chat-app-backend-dummy.up.railway.app) ([repo](https://github.com/arham213/chat-app-backend))

---

<!-- Add a screenshot or GIF of the app here -->
<!-- ![Dashboard Preview](./docs/screenshot.png) -->

## Features

- JWT-based authentication (signup and login)
- Real-time bidirectional messaging via Socket.IO
- Typing indicators and read/unread message state
- Online presence detection
- In-chat image sharing
- Protected routes with session-based auth guard
- Responsive glassmorphic UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript |
| Real-time | Socket.IO Client |
| Build | Create React App |
| Frontend Deployment | Vercel |
| Backend Deployment | Railway |

---

## Local Setup

### Prerequisites
- Node.js 18+
- [chat-app-backend](https://github.com/arham213/chat-app-backend) running locally or remotely *(required — must be running before starting the frontend)*

```bash
git clone https://github.com/arham213/chat-app-frontend.git
cd chat-app-frontend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
REACT_APP_BASE_URL=your_backend_url
REACT_APP_SOCKET_URL=your_socket_url
```

```bash
npm start
```

See the [backend README](https://github.com/arham213/chat-app-backend#readme) for full backend setup instructions.

---

[LinkedIn](https://linkedin.com/in/arhamasjid) · arhamasjid213@gmail.com
