# KNOT – University Resource & Maintenance Management Platform
## Project No. 19 | Milestone 3 Completed

## 📌 Project Overview

KNOT is a centralized web-based platform designed to manage university resource booking and maintenance reporting within the Faculty of Engineering. The system integrates lecture hall and laboratory scheduling with campus issue reporting to improve transparency, efficiency, and coordination across students, staff, booking administrators, maintenance administrators, and technicians.

---

## 🎯 Problem Statement

The Faculty traditionally relies on manual record books and informal communication methods (verbal reports, emails) to manage lecture hall bookings and maintenance issues. This leads to:

- Booking conflicts and scheduling errors  
- Lack of visibility into request status  
- Delayed maintenance responses  
- Poor coordination between academic and administrative departments  

KNOT addresses these challenges through a unified digital solution with automated conflict detection and real-time tracking.

---

## 🚀 Key Milestone Implemented Updates

- **Bulk Semester Schedule Import (Dean's Requirement)**:
  - **Excel / CSV Timetable Import**: Built specifically per the Dean's request to handle pre-booked master semester timetables.
  - **Automated Validation & Ingestion**: Reads semester schedule files, parses day/time/hall/lecturer attributes, automatically checks for conflicts against existing reservations, skips overlapping slots, and bulk-populates recurring semester lectures into the database.
- **Booking Admin Portal "All Bookings" Filtering & Sorting**:
  - **Multi-Criteria Search & Filter**: Filter by Search Text (matching room, lecturer name, user role, or purpose), Multi-Select Room badges (e.g., `EOE Hall`, `DO1`, `Lecture Hall 1`), Quick Date Presets (`Today`, `Tomorrow`, `This Week`, `Future`), Custom Date Ranges, and Status (`Approved`, `Pending AR`, `Pending`, `Rejected`).
  - **Dynamic Table Sorting**: Sort table data flexibly by Date (Newest/Oldest), Lecture Hall Name, or Status.
- **Maintenance Worker / Technician Portal (`TechnicianDashboard` & Static Worker Portal)**:
  - **Admin Task Assignment**: Maintenance Admins review fault reports, assign specific technicians (*Alex Johnson*, *Sam Carter*), set priority levels, and attach technical directives.
  - **Technician Task Queue**: Technicians receive custom, real-time task queues tailored to their user ID.
  - **Interactive Task Modal & Evidence Inspector**: Technicians inspect full location info, map coordinates, reporter descriptions, and user evidence photos.
  - **Status Progression & Work Logs**: Technicians update jobs in real-time (`Open` ➡️ `In Progress` ➡️ `Resolved`), add maintenance resolution notes, and upload proof-of-work photos upon completion.
- **Interactive Real-Time Hall Availability Grid**:
  - Visual hourly slot selection grid (08:00 AM – 06:00 PM) replacing static dropdowns.
  - Real-time database conflict checking for approved reservations.
  - Color-coded badges (`Available`, `Booked: [Purpose]`, `Already Passed`) and occupied range protection.
- **Semester Timetable Calendar Enhancements**:
  - Native HTML5 datepicker calendar date filtering.
  - Datepicker-filtered **Agenda View** displaying lectures strictly for selected dates.
  - Single-room timeline grid view when filtering by a specific hall.
  - Standardized 10 uniform lecture hall names across all UI elements and database schemas (`EOE Hall`, `DO1`, `DO2`, `Lecture Hall 1`, `Lecture Hall 2`, `Seminar Room 1`, `Seminar Room 2`, `Computer Lab 1`, `Computer Lab 2`, `Main Auditorium`).
- **Maintenance Reporting & Admin Evidence Viewer**:
  - OpenStreetMap Leaflet location selector with reverse-geocoding (Nominatim API) and map pin dropping.
  - Support for high-resolution Base64 photo attachments with 50MB backend payload limits.
  - Maintenance Admin Ticket Details view with a dedicated **Evidence Photo Viewer**.
- **Multi-Tier Resource Booking Approval Workflow**:
  - Student Request ➡️ Lecturer Endorsement ➡️ Booking Admin Final Approval with rejection feedback notes.

---

## 🔑 Demo Access Credentials

| Role | Username | Password | Access & Portal Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `e22237` | `1234` | Hall & lab bookings, interactive slot picker, fault reporting with map pins & photo attachments |
| **Lecturer** | `lecturer1` | `1234` | Direct room booking, student request endorsement/rejection, fault reporting |
| **Booking Admin** | `bookadmin` | `adminpass` | Final AR office hall approvals, rejection feedback, bulk schedule import, multi-criteria sorting/filtering, auto-booking toggle |
| **Maintenance Admin** | `admin` | `adminpass` | Full ticketing management, technician task assignments, evidence photo viewer, maintenance notes |
| **Technician / Worker** | `alex` | `1234` | Assigned task queue, interactive job detail modal, status updates (`In Progress`/`Resolved`), work logs |

---

## 💻 Quick Start & Running Commands

### 1️⃣ Database Setup & Initialization
Ensure MySQL is running on `localhost:3306`, then execute:
```bash
node code/KNOT_Basement/Student_Portal/database/setup_db.js
```

### 2️⃣ Start the Gateway Server
Launch all backend and frontend services simultaneously:
```bash
node code/KNOT_Basement/gateway_server.js
```
Open your browser and navigate to **`http://localhost:3000`**.

---

## 🏗️ System Architecture & Stack

- **Frontend:** React.js, Tailwind CSS, Vite, Lucide & Material Symbols Icons, Leaflet (OpenStreetMap)  
- **Backend:** Node.js, Express.js (50MB payload support for Base64 attachments & bulk import parsing)  
- **Database:** MySQL (`knot_db`) with relational normalization and automatic schema migrations  
- **Architecture:** Unified Gateway Server (`gateway_server.js`) orchestrating RESTful micro-services  

---

## 📅 Project Timeline & Milestone Status

- **Milestone 1** – Requirement Finalization, UI Design & Architecture Setup ✅ *(Completed)*
- **Milestone 2** – Booking Workflow, Conflict Detection, Bulk Timetable Import Specification & Basic Maintenance Reporting ✅ *(Completed)*
- **Milestone 3** – Bulk Excel Semester Schedule Ingestion, Admin Multi-Criteria Sorting & Filtering, Maintenance Worker Portal Integration, Admin Task Assignment Workflow, Interactive Slot Availability Grid, Map/Photo Evidence Viewer & Comprehensive MVP Validation ✅ *(Completed)*

---

## 👥 Team Roles

- **Team Leader / Lead Developer:** Minhaj Ali (E/22/237) – System Architecture, Gateway Integration, Availability Grid & Backend APIs  
- **Product Owner:** Senara Senanayake (E/22/366) – Requirements & UX Design  
- **Developer:** Chamudi Perera (E/22/280) – Student Interface & Timetable Calendar  
- **Developer:** Ewmi Wijesinghe (E/22/443) – Maintenance Workflow & Technician Panel  
