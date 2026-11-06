# ConnectSphere – Professional Real-Time Communication Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.IO-6366f1.svg)](https://react.dev/)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%208.0%2B-emerald.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**ConnectSphere** is a high-performance, real-time messaging and team collaboration platform designed for modern engineering teams. Engineered from the ground up using the MERN stack (MongoDB, Express, React, Node.js) paired with a bidirectional Socket.IO WebSocket architecture, ConnectSphere provides an enterprise-ready communication layer with sub-millisecond event delivery, persistent chat history, role-based authorization, media pipelines, and an administrative moderation console.

---

## 1. Key Features

- **Real-Time 1-to-1 & Group Messaging**: Instant message delivery and reception powered by Socket.IO with multi-tab presence tracking.
- **Rich Message Interactions**: Threaded replies, inline message editing, deletion ("for me" vs. "for everyone"), and emoji reactions.
- **Dynamic Presence & Typing State**: Live presence indicator (`available`, `busy`, `away`, `offline`), last seen timestamps, and throttled typing bounce indicators.
- **Group Guild Management**: Dedicated group administrator controls, group image and metadata editing, member search & invite modal, and member departure.
- **Media & Document Pipeline**: Image gallery previews, PDF/DOCX file attachments with byte size formatting and direct downloads. Dual support for Cloudinary or automatic local storage fallback.
- **Defense-in-Depth Security**: JWT sessions via HTTP-only cookies and Bearer tokens, bcrypt salted password hashing, rate limiting against brute-force attacks, and Helmet security headers.
- **Administrative Command Center**: Overview metrics (total users, active sessions, message volume, group metrics), user account suspension/reactivation, role management (User/Admin), and user moderation reports queue.
- **Tailwind UI/UX**: Dark-first SaaS aesthetic with charcoal backgrounds, royal-blue glowing accents (`#4f46e5`), glassmorphic panels, responsive 3-pane dashboard, and modern color-scheme switching.

---

## 2. Technology Stack

### Frontend
- **React 18** with **Vite 6** (Fast Refresh & Rollup bundling)
- **Tailwind CSS 3** with custom theme tokens & dark mode class switching
- **React Router DOM 7** for declarative nested client-side routing
- **Lucide React** for lightweight, consistent vector iconography
- **Axios** with automatic Bearer token interceptor and credential cookies
- **Date-fns** for context-aware timestamp formatting
- **Socket.IO Client** for persistent WebSocket channels

### Backend
- **Node.js 22 & Express.js 4**
- **Socket.IO 4** for WebSocket gateway and room broadcasting
- **MongoDB 8 & Mongoose ODM 8** with indexing and relational population
- **JWT (JSON Web Tokens)** & **Bcrypt.js**
- **Multer** for multipart/form-data handling with MIME-type allowlists
- **Cloudinary SDK** with zero-config local storage fallback
- **Helmet, CORS, Express-Rate-Limit, Morgan**

---

## 3. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT (Vite + React)                             |
|  [Landing] [Auth: Login/Register] [Chat Dashboard: 3-Pane UI] [Profile] [Admin]   |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST + WebSocket (Socket.IO)
                                           v
+-----------------------------------------------------------------------------------+
|                              BACKEND (Node.js + Express)                          |
|  - Auth & Security (JWT, bcrypt, rate limiting, helmet, CORS)                     |
|  - RESTful APIs (/api/auth, /api/users, /api/conversations, /api/messages, admin) |
|  - Socket.IO Server (Presence, Rooms, Typing, Instant Messaging, Receipts)        |
|  - Media Engine (Cloudinary + Local Disk fallback with mime validation)          |
+------------------------------------------+----------------------------------------+
                                           | Mongoose ODM
                                           v
+-----------------------------------------------------------------------------------+
|                              DATABASE (MongoDB Engine)                            |
|  - Users Collection      - Conversations Collection      - Messages Collection    |
|  - Notifications         - Reports                       - Indexes & Relations    |
+-----------------------------------------------------------------------------------+
```

---

## 4. Database Relationship Model

```
+------------------+           +-----------------------+           +------------------+
|      User        |           |     Conversation      |           |     Message      |
+------------------+           +-----------------------+           +------------------+
| _id (ObjectId)   | 1       N | _id (ObjectId)        | 1       N | _id (ObjectId)   |
| name             |<--------->| participants: [User]  |<--------->| conversation (Ref|
| username         |           | isGroup (Boolean)     |           | sender (Ref:User)|
| email            |           | groupName (String)    |           | content (String) |
| password (hash)  |           | groupAdmin (Ref:User) |           | messageType      |
| avatar (URL)     |           | lastMessage (Ref:Msg) |           | attachments []   |
| role (user/admin)|           | unreadCounts (Map)    |           | readBy []        |
| status           |           | createdAt, updatedAt  |           | reactions []     |
| isSuspended      |           +-----------------------+           | replyTo (Ref:Msg)|
| lastSeen         |                                               | isEdited, isDel  |
+------------------+                                               +------------------+
         | 1                                                                |
         |                                                                  |
         v N                                                                v
+------------------+                                               +------------------+
|      Report      |                                               |   Notification   |
+------------------+                                               +------------------+
| reporter (User)  |                                               | recipient (User) |
| reportedUser     |                                               | sender (User)    |
| reason, desc     |                                               | type, title      |
| status           |                                               | isRead (Boolean) |
+------------------+                                               +------------------+
```

---

## 5. Folder Structure

```
ConnectSphere/
├── package.json                   # Root package with monorepo execution scripts
├── .gitignore
├── README.md                      # Platform documentation & deployment guide
│
├── server/                        # Express.js + Socket.IO Backend
│   ├── config/
│   │   ├── db.js                  # MongoDB Mongoose connection
│   │   └── cloudinary.js          # Cloudinary media config + fallback
│   ├── controllers/
│   │   ├── authController.js      # Auth & password workflows
│   │   ├── userController.js      # Profile, directory, password change
│   │   ├── conversationController.js # Direct & group management
│   │   ├── messageController.js   # Message CRUD, pagination, reactions
│   │   ├── uploadController.js    # Multi-format file uploads
│   │   └── adminController.js     # User moderation, reports, analytics
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT token validation
│   │   ├── roleMiddleware.js      # Role-based authorization (admin)
│   │   ├── rateLimiter.js         # Endpoint rate limiting
│   │   ├── uploadMiddleware.js    # Multer disk & file filter
│   │   └── errorHandler.js        # Centralized HTTP error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   └── Report.js
│   ├── routes/                    # Express REST route definitions
│   ├── sockets/
│   │   └── socketManager.js       # Real-time WebSocket event gateway
│   ├── tests/
│   │   └── api_verification.js    # Automated 12-suite API & socket test
│   ├── utils/
│   │   ├── seedData.js            # Database seeding utility
│   │   └── tokenUtils.js          # JWT & Cookie helpers
│   ├── uploads/                   # Local file fallback directory
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js                  # Main server entry point
│
└── client/                        # React + Vite Frontend
    ├── index.html                 # HTML entry with FOUC theme script
    ├── vite.config.js             # Vite config with API & WS proxy
    ├── tailwind.config.js         # Tailwind color tokens & dark config
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css              # Custom styling, scrollbars, bubble styling
        ├── context/
        │   ├── AuthContext.jsx    # User session state
        │   ├── SocketContext.jsx  # Socket.IO connection & online presence
        │   ├── ChatContext.jsx    # Real-time messages & active chats
        │   └── ThemeContext.jsx   # Dark / Light theme synchronization
        ├── services/
        │   ├── api.js             # Axios base instance & interceptors
        │   ├── authService.js
        │   ├── userService.js
        │   ├── chatService.js
        │   ├── uploadService.js
        │   └── adminService.js
        ├── components/
        │   ├── common/            # Navbar, Footer, Modal, Avatar
        │   └── chat/              # Sidebar, ChatArea, MessageBubble,
        │                          # MessageInput, ChatDetails, CreateGroup
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ForgotPasswordPage.jsx
        │   ├── ResetPasswordPage.jsx
        │   ├── ChatDashboardPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── AdminDashboardPage.jsx
        │   └── NotFoundPage.jsx
        └── routes/
            ├── ProtectedRoute.jsx
            ├── AdminRoute.jsx
            └── AppRoutes.jsx
```

---

## 6. Installation & Quick Start

### Prerequisites
- **Node.js** v18+ (v20+ recommended)
- **MongoDB** running locally on `localhost:27017` or a MongoDB Atlas URI

### Step 1: Clone and Install
```bash
git clone https://github.com/your-username/ConnectSphere.git
cd ConnectSphere

# Install all root, server, and client dependencies
npm run install:all
```

### Step 2: Configure Environment Variables
Inside `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/connectsphere
JWT_SECRET=connectsphere_jwt_super_secret_production_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary (if left blank, uses local /uploads/ fallback)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Step 3: Seed Database with Test Accounts & Chats
```bash
npm run seed
```
This populates the database with realistic conversations, group chats, messages, reactions, and the following accounts:

| Role | Name | Email | Password |
|---|---|---|---|
| **Administrator** | Eleanor Vance | `admin@connectsphere.com` | `AdminPass123!` |
| **User (Architect)** | Alex Morgan | `alex@connectsphere.com` | `UserPass123!` |
| **User (UI/UX)** | Sarah Jenkins | `sarah@connectsphere.com` | `UserPass123!` |
| **User (DevOps)** | Marcus Brody | `marcus@connectsphere.com` | `UserPass123!` |

*(Note: The Login page also features 1-click quick login buttons to switch between these accounts instantly in separate browser tabs!)*

### Step 4: Run Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
npm run server:dev
```
*Server starts on `http://localhost:5000` with WebSocket gateway ready.*

**Terminal 2 (Frontend Client):**
```bash
npm run client
```
*Vite client starts on `http://localhost:5173`.*

---

## 7. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/auth/logout` | Private | Clear session cookie |
| `GET` | `/api/auth/me` | Private | Fetch authenticated user data |
| `POST` | `/api/auth/forgot-password` | Public | Generate reset token |
| `POST` | `/api/auth/reset-password` | Public | Update password using token |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/search?q=:query` | Private | Search users by name, username, or email |
| `GET` | `/api/users` | Private | Retrieve team user directory |
| `GET` | `/api/users/:id` | Private | Fetch user profile by ID |
| `PUT` | `/api/users/profile` | Private | Update user details & status |
| `PUT` | `/api/users/password` | Private | Change password |

### Conversations (`/api/conversations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/conversations` | Private | List all conversations for user |
| `POST` | `/api/conversations/direct` | Private | Get or create 1-to-1 conversation |
| `POST` | `/api/conversations/group` | Private | Create new group conversation |
| `GET` | `/api/conversations/:id` | Private | Get conversation by ID |
| `PUT` | `/api/conversations/:id` | Private | Update group name, avatar, bio |
| `DELETE` | `/api/conversations/:id` | Private | Delete conversation |
| `POST` | `/api/conversations/:id/members` | Private | Add member to group |
| `DELETE` | `/api/conversations/:id/members/:memberId`| Private | Remove member or leave group |

### Messages (`/api/messages`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/messages/:conversationId` | Private | Retrieve paginated message stream |
| `POST` | `/api/messages` | Private | Send new message |
| `PUT` | `/api/messages/:id` | Private | Edit sent message |
| `DELETE` | `/api/messages/:id` | Private | Delete for me or for everyone |
| `POST` | `/api/messages/:id/reactions` | Private | Add or remove emoji reaction |

### Uploads (`/api/uploads`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/uploads` | Private | Upload media / file (multipart/form-data) |

### Admin Moderation (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | Real-time system metrics & KPIs |
| `GET` | `/api/admin/users` | Admin | Paginated user management table |
| `PUT` | `/api/admin/users/:id/status` | Admin | Suspend or reactivate user account |
| `PUT` | `/api/admin/users/:id/role` | Admin | Update user role (`user` / `admin`) |
| `GET` | `/api/admin/reports` | Admin | List moderation reports |
| `PUT` | `/api/admin/reports/:id` | Admin | Resolve or dismiss report |

---

## 8. Socket.IO Real-Time Architecture

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join_conversation` | Client → Server | `conversationId` | Join conversation WebSocket room |
| `leave_conversation` | Client → Server | `conversationId` | Leave conversation room |
| `send_message` | Client → Server | `data: { conversationId, content, ... }` | Persist & broadcast message |
| `new_message` | Server → Client | `{ conversationId, message }` | Broadcast new message to room |
| `typing` | Bidirectional | `{ conversationId, user }` | Typing indicator trigger |
| `stop_typing` | Bidirectional | `{ conversationId, userId }` | Stop typing indicator |
| `mark_as_read` | Client → Server | `{ conversationId, messageIds }` | Update read receipts |
| `message_read` | Server → Client | `{ conversationId, userId, messageIds }` | Broadcast read receipts |
| `user_online` | Server → Client | `{ userId, status, lastSeen }` | Broadcast user presence online |
| `user_offline` | Server → Client | `{ userId, lastSeen }` | Broadcast user presence offline |
| `online_users_list` | Server → Client | `[userId]` | Initial sync of online user IDs |

---

## 9. Testing & Quality Assurance

### Automated API & Socket Test Suite
To execute the automated 12-test suite verifying REST routes, authentication, authorization, and WebSocket connectivity:
```bash
cd server
node tests/api_verification.js
```

### Manual Testing Verification Checklist
1. **User Authentication**:
   - Register a new account with custom avatar upload.
   - Login with invalid password (confirms 401 error message).
   - Login with demo accounts via the 1-click buttons.
2. **Multi-User Real-Time Chat**:
   - Open two browser windows (one regular, one incognito).
   - In Window 1, login as Alex Morgan (`alex@connectsphere.com`).
   - In Window 2, login as Sarah Jenkins (`sarah@connectsphere.com`).
   - Select their direct conversation and observe the instant typing indicator and real-time message bubble appearance without refreshing.
   - Send an emoji reaction from Window 1 and observe Window 2 update its reaction count instantly.
3. **Group Messaging**:
   - Click the "Create Group" icon in the sidebar.
   - Select 2 or more participants and create "Frontend Guild".
   - Send a message and verify all participants receive the notification and see the conversation bump to the top.
4. **Media Sharing**:
   - Click the attachment icon in the chat input bar, upload an image or PDF.
   - Verify image preview zoom and file download link in right sidebar.
5. **Administrative Console**:
   - Login as `admin@connectsphere.com`.
   - Access the `/admin` link in the navbar or sidebar.
   - Test suspending a user account, then attempt logging in with that suspended user (verifies 403 suspension block).

---

## 10. Deployment Guide

### Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under "Network Access", allow `0.0.0.0/0` (or host IP).
3. Copy your connection string `mongodb+srv://<user>:<password>@cluster0.mongodb.net/connectsphere?retryWrites=true&w=majority`.

### Backend: Render / Railway
1. Push this repository to GitHub.
2. Create a new Web Service on [Render](https://render.com/).
3. Set the Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=<Your MongoDB Atlas URI>`
   - `JWT_SECRET=<A Strong Random Secret Key>`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `CLOUDINARY_CLOUD_NAME=<Optional>`
   - `CLOUDINARY_API_KEY=<Optional>`
   - `CLOUDINARY_API_SECRET=<Optional>`

### Frontend: Vercel / Netlify
1. Create a new project on [Vercel](https://vercel.com/) pointing to the repository.
2. Set Root Directory to `client`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variables:
   - `VITE_API_URL=https://your-backend.onrender.com`
   - `VITE_SOCKET_URL=https://your-backend.onrender.com`

---

## 11. Modern Web Guidance Compliance
- **`<meta name="color-scheme">` Integration**: Synced with Tailwind's `.dark` class to adapt browser-native UI (scrollbars, form controls) alongside CSS utility tokens.
- **FOUC Prevention**: Inline bootstrap script loaded in `<head>` ensures theme consistency before render.
- **Accessible HTML5**: Keyboard-navigable modal dialogs with focus containment and ESC key handlers.

---

## 12. License
This project is licensed under the MIT License.
