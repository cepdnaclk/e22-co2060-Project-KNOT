# KNOT – University Resource & Maintenance Management Platform
## Project No. 19 | Complete Project Milestone Progression

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

## 🚀 Milestone Progress & Feature Progression

### 🔹 Milestone 1: Core Foundation & System Architecture
- **Authentication & Role-Based Access Control (RBAC)**:
  - Multi-role authentication framework supporting 5 distinct user roles: Students, Lecturers, Booking Admins (AR Office), Maintenance Admins, and Field Technicians.
- **Resource Database Schemas**:
  - Relational database normalization for lecture halls, drawing offices, seminar rooms, and computer labs with capacity metrics and operational status tracking.
- **Unified UI Architecture & Design System**:
  - Responsive Single Page Application (SPA) architecture using React.js and Tailwind CSS with glassmorphism UI elements, dark/light theme support, and role-guarded routing.

---

### 🔹 Milestone 2: Multi-Tier Booking Workflow & Maintenance Reporting
- **Multi-Tier Academic Booking Workflow**:
  - Structured 3-step approval chain: Student Request ➡️ Lecturer Endorsement ➡️ Booking Admin (AR Office) Final Approval.
  - Support for rejection feedback notes and booking status visibility for students.
- **Maintenance Reporting Module (Basic)**:
  - Issue submission interface enabling campus users to report infrastructure faults with category tags, descriptions, and urgency priority levels.
- **Admin System Settings**:
  - Configurable `auto_booking` toggle setting for Booking Admins to automate straightforward reservations.

---

### 🌟 Milestone 3: Real-Time Availability Grid, Worker Portal, Bulk Schedule Import & System Integration
- **Bulk Semester Schedule Import Implementation (Dean's Requirement)**:
  - **Master Timetable Import Engine**: Built specifically per the Dean's requirement to handle pre-booked master semester timetables.
  - **Automated Validation & Ingestion**: Reads semester schedule files, parses day/time/hall/lecturer attributes, automatically checks for conflicts against existing database reservations, skips overlapping slots, and bulk-populates recurring semester lectures into the system.
- **Interactive Real-Time Hall Availability Grid**:
  - Visual hourly time-slot selection grid (08:00 AM – 06:00 PM) replacing static dropdowns.
  - Real-time database queries displaying booked status badges (`Available`, `Booked: [Purpose]`, `Already Passed`) and preventing double-booking over occupied ranges.
- **Maintenance Worker Portal Integration (`TechnicianDashboard` & Static Worker Portal)**:
  - **Admin Task Assignment & Dispatch**: Maintenance Admins review fault reports, assign specific technicians (*Alex Johnson*, *Sam Carter*), set priority levels, and attach technical directives.
  - **Technician Task Queue**: Technicians receive custom, real-time task queues tailored to their user ID.
  - **Interactive Task Modal & Evidence Inspector**: Technicians inspect location info, map coordinates, reporter notes, and user evidence photos.
  - **Status Progression & Work Logs**: Technicians update jobs in real-time (`Open` ➡️ `In Progress` ➡️ `Resolved`), add maintenance resolution notes, and upload proof-of-work photos upon completion.
- **Semester Timetable Calendar & Single-Room Timeline View**:
  - Native HTML5 datepicker calendar filtering with Datepicker-Filtered Agenda View.
  - Focused single-room timeline grid view when filtering by a specific hall.
  - Standardized 10 uniform lecture hall names across all UI elements and database schemas (`EOE Hall`, `DO1`, `DO2`, `Lecture Hall 1`, `Lecture Hall 2`, `Seminar Room 1`, `Seminar Room 2`, `Computer Lab 1`, `Computer Lab 2`, `Main Auditorium`).
- **Interactive Map Pinning & Photo Evidence Inspector**:
  - OpenStreetMap Leaflet location selector with reverse-geocoding (Nominatim API) and map pin dropping.
  - High-resolution photo evidence upload with 50MB backend payload support.
  - Maintenance Admin Ticket Details view with a dedicated **Evidence Photo Viewer**.
- **Booking Admin Portal Advanced Sorting, Multi-Criteria Filtering & Automated System**:
  - **Automated Reservation Approval Engine**: Implemented an automated booking approval system for the Booking Admin Portal. When enabled (`auto_booking: true`), routine conflict-free reservation requests are automatically validated and instantly approved (`Approved`) without requiring manual AR office intervention.
  - **System Auto-Booking Control Panel**: Configurable system-wide toggle in Booking Admin settings with persistent database state (`settings` table) allowing admins to seamlessly switch between automated instant approvals and manual review.
  - **Multi-Criteria Search & Filter**: Filter by search text, multi-select room badges, quick date presets (`Today`, `Tomorrow`, `This Week`, `Future`), custom date range pickers, status pills (`Approved`, `Pending AR`, `Pending`, `Rejected`), and dynamic multi-column table sorting.

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

## 📅 Milestone Summary

- **Milestone 1** – Core Architecture, UI Design & Multi-Role RBAC Authentication Setup ✅ *(Completed)*
- **Milestone 2** – Multi-Tier Booking Workflow & Basic Maintenance Reporting ✅ *(Completed)*
- **Milestone 3** – Dean's Bulk Semester Timetable Import, Interactive Availability Grid, Worker Portal Integration, Admin Task Assignment, Map & Photo Evidence Inspector, Timetable Agenda View & System Validation ✅ *(Completed)*

---

## 👥 Team Roles

- **Team Leader / Lead Developer:** Minhaj Ali (E/22/237) – System Architecture, Gateway Integration, Availability Grid & Backend APIs  
- **Product Owner:** Senara Senanayake (E/22/366) – Requirements & UX Design  
- **Developer:** Chamudi Perera (E/22/280) – Student Interface & Timetable Calendar  
- **Developer:** Ewmi Wijesinghe (E/22/443) – Maintenance Workflow & Technician Panel  
