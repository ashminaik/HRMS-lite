# HRMS Lite - Human Resource Management System

A lightweight, full-stack Human Resource Management System for managing employee records and tracking daily attendance.

## 🔗 Live Application

- **Frontend**: [https://hrms-lite-silk.vercel.app](https://hrms-lite-silk.vercel.app)
- **Backend API**: [https://hrms-lite-production-5b91.up.railway.app](https://hrms-lite-production-5b91.up.railway.app)
- **GitHub Repository**: [https://github.com/ashminaik/HRMS-lite](https://github.com/ashminaik/HRMS-lite)

## 📋 Features Implemented

### ✅ Core Requirements (All Completed)

#### 1. Employee Management
- ✅ Add new employee with:
  - Employee ID (unique, auto-generated)
  - Full Name
  - Email Address
  - Department
  - Role
  - Gender
- ✅ View list of all employees
- ✅ Delete employee records
- ✅ Server-side validation for required fields and email format
- ✅ Duplicate employee handling

#### 2. Attendance Management
- ✅ Mark attendance for employees with:
  - Date selection
  - Status (Present / Absent / On Leave)
- ✅ View attendance records for each employee
- ✅ Quick mark attendance with bulk actions

### 🎁 Bonus Features Implemented
- ✅ Filter attendance by date using calendar
- ✅ Filter employees by department and role (smart filters)
- ✅ Display total present days per employee
- ✅ Dashboard with summary cards showing:
  - Total employees
  - Present count
  - Absent count
  - On leave count
- ✅ Statistics page with visual charts (attendance trends)
- ✅ Search employees by name, ID, department, or role

### 🎨 Additional Features
- Professional, production-ready UI with Tailwind CSS
- Responsive design for all screen sizes
- Loading states and error handling
- Empty states with helpful messages
- Interactive calendar for date filtering
- Visual attendance charts (line graphs)
- Gender distribution charts
- Smart role/department filtering (selecting department auto-filters roles)

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 4.0
- **Charts**: react-apexcharts 1.9.0
- **Routing**: react-router-dom 7.2.1
- **HTTP Client**: Axios
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 9.1.6
- **CORS**: cors 2.8.6
- **Environment**: dotenv 16.4.5
- **Deployment**: Railway

### Database Schema

**Employee Model:**
```javascript
{
  employeeId: String (unique),
  fullName: String (required),
  email: String (required, validated),
  department: String (required),
  role: String (required),
  gender: String (required)
}
```

**Attendance Model:**
```javascript
{
  employeeId: String (required),
  date: Date (required),
  status: String (enum: Present, Absent, On Leave)
}
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Clone Repository
```bash
git clone https://github.com/ashminaik/HRMS-lite.git
cd HRMS-lite
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "MONGO_URI=your_mongodb_connection_string" > .env
echo "MONGO_DB=hrms_lite" >> .env
echo "PORT=5050" >> .env

# Run backend
npm start
```

Backend will run on `http://localhost:5050`

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5050" > .env

# Run frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Seeding Sample Data (Optional)
```bash
cd backend
node seed.js
node seedAttendance.js
```

This will populate the database with 29 sample employees and attendance records for January-February 2026.

## 📡 API Endpoints

### Employee Endpoints
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance Endpoints
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance?month=1&year=2026` - Filter by month/year
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/summary/:employeeId` - Get employee attendance summary

## 🎯 Features Breakdown

### Dashboard
- Real-time employee count cards
- Today's attendance status (Present, Absent, On Leave)
- Quick mark attendance section with date picker
- Employee list with search functionality

### Employee Management
- Add employee form with validation
- Employee list table with delete action
- Search across all employee fields
- Filter by department and role with smart autocomplete

### Attendance Tracking
- Calendar-based date filtering
- Visual attendance indicators
- Bulk attendance marking
- Individual employee attendance history

### Statistics
- Attendance trend line chart
- Gender distribution pie chart
- Monthly attendance totals
- Visual data representation

## 🔒 Error Handling

### Backend Validations
- Required field validation
- Email format validation
- Unique employee ID enforcement
- Duplicate entry prevention
- Proper HTTP status codes (200, 201, 400, 404, 409, 500)
- Meaningful error messages

### Frontend Error States
- Loading spinners during API calls
- Error messages for failed requests
- Empty state messages
- Form validation feedback
- Network error handling

## 🌐 Deployment

### Backend (Railway)
1. Connected to GitHub repository
2. Root directory set to `/backend`
3. Environment variables configured:
   - `MONGO_URI`: MongoDB Atlas connection string
   - `MONGO_DB`: Database name
4. Automatic deployments on git push

### Frontend (Vercel)
1. Connected to GitHub repository
2. Root directory set to `/frontend`
3. Framework preset: Vite
4. Environment variable: `VITE_API_URL` pointing to Railway backend
5. Automatic deployments on git push

## 📝 Assumptions & Limitations

### Assumptions
- Single admin user (no authentication required as per assignment)
- All employees work standard days (Monday-Friday)
- Attendance can be marked for past dates
- Employee IDs are auto-generated (EMP001, EMP002, etc.)

### Known Limitations
- No user authentication/authorization (intentionally excluded per requirements)
- No payroll management
- No leave management system
- No employee edit functionality (can delete and re-add)
- No bulk employee import
- No notification system
- No audit logs

### Out of Scope (As Per Assignment)
- Leave management
- Payroll processing
- Performance reviews
- Advanced HR features
- Multi-user authentication
- Role-based access control

## 🧪 Testing

The application has been tested for:
- ✅ CRUD operations for employees
- ✅ Attendance marking and retrieval
- ✅ Data validation
- ✅ Error handling
- ✅ Responsive design
- ✅ Cross-browser compatibility
- ✅ API endpoint functionality
- ✅ Database persistence

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🎨 UI/UX Highlights

- Clean, professional interface
- Consistent color scheme (indigo accent colors)
- Intuitive navigation with sidebar
- Responsive grid layouts
- Interactive hover states
- Smooth transitions and animations
- Accessible form controls
- Mobile-optimized design

## 📊 Sample Data

The deployed application includes 29 sample employees across 5 departments:
- HR (Recruitment, Training)
- Finance (Accounting, Financial Planning)
- IT (Development, Infrastructure)
- Marketing (Digital Marketing, Content Strategy)
- Operations (Logistics, Quality Assurance)

Attendance data is seeded for January-February 2026 with realistic patterns.

## 🔧 Development

### Project Structure
```
HRMS-lite/
├── backend/
│   ├── config/         # Database configuration
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── dummyData.js    # Sample data
│   ├── seed.js         # Database seeder
│   └── server.js       # Express app
├── frontend/
│   ├── src/
│   │   ├── assets/     # Static assets
│   │   ├── components/ # React components
│   │   ├── App.jsx     # Main app component
│   │   └── main.jsx    # Entry point
│   └── index.html
└── README.md
```

## 👨‍💻 Developer

**Ashmi Naik**
- GitHub: [@ashminaik](https://github.com/ashminaik)

## 📄 License

This project is created as part of a coding assignment.

---

## ✨ Highlights

This HRMS Lite application demonstrates:
- ✅ Full-stack development proficiency
- ✅ RESTful API design
- ✅ Database modeling and persistence
- ✅ Modern React development with hooks
- ✅ Responsive UI/UX design
- ✅ Error handling and validation
- ✅ Production deployment
- ✅ Clean, maintainable code
- ✅ Professional documentation

**Total Development Time**: Completed within 8 hours as per assignment requirements.

---

**Note**: This application is fully functional and production-ready. All core requirements and bonus features have been implemented successfully
