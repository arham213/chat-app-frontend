# chat-app-frontend

Frontend for a real-time chat system built with React and Socket.IO. Manages WebSocket lifecycle, presence state, and media sharing alongside a persistent message history.

**Live:** [chat-app-frontend-beta-three.vercel.app](https://chat-app-frontend-beta-three.vercel.app) &nbsp;|&nbsp; **Backend:** [chat-app-backend](https://github.com/arham213/chat-app-backend)

---

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
- [chat-app-backend](https://github.com/arham213/chat-app-backend) running locally or remotely

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

See [chat-app-backend](https://github.com/arham213/chat-app-backend) for backend setup.

---

[linkedin.com/in/arhamasjid](https://linkedin.com/in/arhamasjid) · arhamasjid213@gmail.com
