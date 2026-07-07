# 📓 Internship Diary Web App

A full-stack web application that digitizes the college internship diary process — replacing the physical diary with a structured, role-based web platform.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | ASP.NET Core Web API (.NET 10) |
| Database | MySQL |
| ORM | Dapper (micro-ORM) |
| API Testing | Scalar |

## 👥 Roles

- **Student** — Creates internship profile, adds diary entries every 2 days, uploads mentor verification video
- **College Staff** — Reviews diary entries, approves/rejects with remarks, watches mentor verification video

## 📁 Project Structure

```
internship-diary/
├── backend/          # ASP.NET Core Web API
│   ├── Controllers/  # Auth, Internship, Diary endpoints
│   ├── Models/       # User, Internship, DiaryEntry
│   └── Data/         # DbConnectionFactory (Dapper)
└── frontend/         # React + Vite
    └── src/
        └── pages/    # Login, Register, StudentDashboard, StaffDashboard
```

## 🗄️ Database Schema

Three tables: `users`, `internships`, `diary_entries`

### users
| Column | Type | Description |
|---|---|---|
| id | INT | Primary key |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(150) | Unique email |
| password_hash | VARCHAR(255) | MD5 hashed password |
| role | ENUM | 'student' or 'staff' |

### internships
| Column | Type | Description |
|---|---|---|
| id | INT | Primary key |
| student_id | INT | FK to users |
| org_name | VARCHAR(150) | Organization name |
| mentor_name | VARCHAR(100) | Org mentor name |
| mentor_video_path | VARCHAR(255) | Path to verification video |
| overall_status | ENUM | in_progress / pending_final_review / completed |

### diary_entries
| Column | Type | Description |
|---|---|---|
| id | INT | Primary key |
| internship_id | INT | FK to internships |
| period_start_date | DATE | Entry start date |
| period_end_date | DATE | Entry end date |
| work_description | TEXT | Work done |
| staff_status | ENUM | pending / approved / needs_revision |
| staff_remarks | VARCHAR(500) | Staff feedback |

## ⚙️ Setup Instructions

### Prerequisites
- Visual Studio 2022 with ASP.NET workload
- MySQL 8.0+
- Node.js 18+

### Backend Setup
1. Clone the repository
2. Open `WebApplication1.sln` in Visual Studio 2022
3. Install MySQL and run `config/schema.sql` to create the database
4. Update `appsettings.json` with your MySQL password:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=internship_diary;User=root;Password=YOUR_PASSWORD;"
}
```
5. Press **F5** to run — API will start on `https://localhost:7003`
6. Open `https://localhost:7003/scalar/v1` to test endpoints

### Frontend Setup
1. Navigate to the frontend folder
2. Install dependencies:
```bash
npm install
```
3. Start the dev server:
```bash
npm run dev
```
4. Open `http://localhost:5173`

## 🔑 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register student or staff |
| POST | /api/auth/login | Login |
| POST | /api/internship | Create internship profile |
| GET | /api/internship/my/{studentId} | Get student's own profile |
| GET | /api/internship/all | Get all students (staff only) |
| POST | /api/internship/{id}/upload-video | Upload mentor verification video |
| POST | /api/diary | Add diary entry |
| GET | /api/diary/internship/{id} | Get all entries for an internship |
| GET | /api/diary/{id} | Get single diary entry |
| PUT | /api/diary/{id}/review | Staff reviews an entry |

## 🔄 Application Flow

1. Student registers and logs in
2. Student fills in internship profile (organization + mentor details)
3. Student adds diary entries every 2 days describing their work
4. At the end of internship, student uploads a short mentor verification video
5. College staff logs in, reviews entries, approves or requests revision
6. Staff watches mentor video and gives final approval

## 📸 Screenshots

### Login Page
Clean authentication with role-based routing — students go to their diary dashboard, staff go to the review dashboard.

### Student Dashboard
- Internship profile (organization and mentor details)
- Diary entries list with status badges
- Add new entry form
- Mentor video upload

### Staff Dashboard
- All registered students in a sidebar
- Click any student to view their full diary
- Watch mentor verification video
- Approve or request revision on each entry with remarks

## 🏫 Academic Context

Built as a college internship diary digitization project at JIIT Noida. Replaces the physical diary sign-off process with a structured digital workflow including mentor video verification.