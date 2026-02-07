# HRMS Lite

A modern Human Resource Management System built with React + Node.js + MongoDB.

## 🚀 Live Demo

**[View Live App](https://hrms-lite.vercel.app)** *(Update this link after deployment)*

## Features

- ✅ Employee Management (Add, Edit, Delete)
- ✅ Daily Attendance Tracking (Present, Absent, On Leave)
- ✅ Quick Attendance Panel
- ✅ Statistics Dashboard with Charts
- ✅ Department & Role Filtering
- ✅ Employee Reports with Monthly Calendar View
- ✅ Gender Distribution Analytics

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, ApexCharts
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas

## Local Development

```bash
# Clone the repo
git clone https://github.com/ashminaik/HRMS-lite.git
cd HRMS-lite

# Start backend
cd backend
npm install
node server.js

# Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5050
```

### Backend (.env)
```
MONGO_URI=your_mongodb_connection_string
PORT=5050
```

## Deployment

- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas
