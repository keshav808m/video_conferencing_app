# 🎥 Real-Time Video Meeting App (WebRTC + Socket.IO)

A full-stack real-time video conferencing web application built using WebRTC, Socket.IO, React (Vite), and Node.js.

Users can join a meeting room, share video/audio, screen share, and chat in real time.

---

## 🚀 Live Demo:  https://video-conferencing-app-1-ikhf.onrender.com

---

## ✨ Features

- 🔴 Real-time video calling (WebRTC)
- 🎤 Toggle microphone on/off
- 📷 Toggle camera on/off
- 🖥 Screen sharing support
- 💬 Real-time chat system
- 👥 Multiple participants in same room
- 🔔 Unread message counter
- 📱 Responsive design (Mobile supported)
- 🌐 Deployed on Render

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Socket.IO Client
- WebRTC
- Material UI
- CSS Modules

### Backend
- Node.js
- Express
- Socket.IO
- CORS

---

## 🧠 How It Works

1. Users join a meeting using a unique URL.
2. Socket.IO connects all users in the same room.
3. WebRTC establishes peer-to-peer media connections.
4. ICE candidates and SDP are exchanged via Socket.IO.
5. Chat messages are broadcast in real-time.
6. When a user leaves, connections are cleaned automatically.
