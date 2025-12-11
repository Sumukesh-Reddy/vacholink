# ꍡ VachoLink 

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://vacholink.vercel.app)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.5.0-white?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)

A modern, real-time chat application with stunning visual effects and seamless communication experience. Connect with friends and colleagues in style.

---

## ✨ Features

### 🌟 **Visual Experience**
- **Animated Star Backgrounds**: Dynamic starry backgrounds with twinkling effects  
- **Smooth Transitions**: Fluid animations throughout the application  
- **Dark Theme**: Eye-friendly dark interface with accent colors  
- **Responsive Design**: Perfectly adapts to all screen sizes  
- **Glowing UI Elements**: Interactive elements with glow effects  

### 💬 **Core Chat Features**
- **Real-time Messaging** with Socket.io  
- **Online Status Indicators**  
- **Typing Indicators**  
- **Chat Search**  
- **Unread Message Badges**  

### 🔐 **Security & Authentication**
- **JWT Authentication**  
- **Google OAuth Login**  
- **Password Recovery via Email**  
- **Profile Management**  
- **Secure Session Management**  

### 👤 **User Management**
- Custom profiles (name, bio, image)  
- User search  
- Contact list  
- Account settings  

---

## 🚀 Live Demo

🔗 **https://vacholink.vercel.app**

---

## 🛠️ Tech Stack

### **Frontend**
- React 18  
- React Router v6  
- Context API  
- Socket.io Client  
- Styled Components  
- Axios  

### **Backend**
- Node.js  
- Express.js  
- Socket.io  
- MongoDB  
- Mongoose  
- JWT  
- Bcrypt  

---

## 📋 Prerequisites

- Node.js v18+  
- npm or yarn  
- MongoDB instance  

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vacholink.git
cd vacholink
2. Install Dependencies
# Install client dependencies
cd backend
npm install

# Install server dependencies
cd ../frontend
npm install
3. Environment Setup
Create a .env file inside the server folder:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
PORT=3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
4. Run the Application
# Start server
cd server
npm start

# Start client
cd ../backend
npm start
Application URLs:
Frontend → http://localhost:3000
Backend API → http://localhost:3001
📁 Project Structure
vacholink/
├── frontend/ # React application
│ ├── public/ # Static assets
│ └── src/
│ ├── components/ # UI components
│ ├── pages/ # App pages
│ ├── context/ # Context providers
│ └── App.js
│
├── backend/ # Node.js / Express API
│ ├── models/ # Mongoose schemas
│ ├── routes/ # REST API routes
│ ├── middleware/ # Auth & other middleware
│ ├── controllers/ # Route controllers
│ └── server.js # Entry point
│
└── README.md
🔧 API Endpoints

Auth Routes
| Method | Endpoint                    | Description    |
| ------ | --------------------------- | -------------- |
| POST   | `/api/auth/register`        | Register user  |
| POST   | `/api/auth/login`           | Login          |
| POST   | `/api/auth/google`          | Google OAuth   |
| POST   | `/api/auth/forgot-password` | Send reset OTP |
| POST   | `/api/auth/reset-password`  | Reset password |

User Routes
| Method | Endpoint             | Description    |
| ------ | -------------------- | -------------- |
| GET    | `/api/users/search`  | Search users   |
| GET    | `/api/users/:id`     | Get user       |
| PUT    | `/api/users/profile` | Update profile |

Chat Routes
| Method | Endpoint                     | Description  |
| ------ | ---------------------------- | ------------ |
| GET    | `/api/chat/rooms`            | Get rooms    |
| POST   | `/api/chat/room`             | Create room  |
| GET    | `/api/chat/messages/:roomId` | Get messages |
| DELETE | `/api/chat/room/:roomId`     | Delete room  |

👨‍💻 About Me 
I'm Sumukesh Reddy, a full-stack developer passionate about building real-time, scalable web applications.  
I specialize in React, Node.js, MongoDB, and cloud-based automation.  
I love solving problems, learning fast, and creating clean, efficient user experiences.
