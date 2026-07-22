---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: e22-co2060-Project-KNOT
title: Project KNOT – University Resource & Maintenance Management Platform
---

# Project KNOT – System Milestones & Documentation

---

## Team
-  E/22/237, M. F. M. Minhaj Ali, [e22237@eng.pdn.ac.lk](mailto:e22237@eng.pdn.ac.lk)
-  E/22/366, M. D. S. Senanayake, [e22366@eng.pdn.ac.lk](mailto:e22366@eng.pdn.ac.lk)
-  E/22/280, H. C. V. Perera, [e22280@eng.pdn.ac.lk](mailto:e22280@eng.pdn.ac.lk)
-  E/22/443, W. M. E. N. Wijesinghe, [e22443@eng.pdn.ac.lk](mailto:e22443@eng.pdn.ac.lk)

## Supervisor
-  Prof. Roshan G. Ragel, [roshanr@eng.pdn.ac.lk](mailto:roshanr@eng.pdn.ac.lk)

---

#### Table of Contents
1. [Introduction](#introduction)
2. [Milestone Progress & Implemented Features](#milestone-progress--implemented-features)
3. [Solution Architecture](#solution-architecture)
4. [Software Designs](#software-designs)
5. [Testing & System Validation](#testing--system-validation)
6. [Conclusion & Future Work](#conclusion)
7. [Links](#links)

---

## Introduction

#### The Problem
Universities and large educational institutions often suffer from highly fragmented administrative systems. Currently, the processes for booking academic resources (such as lecture halls, labs, and seminar rooms) and reporting infrastructure faults are disconnected. This leads to severe coordination issues between students, academic staff (lecturers), administrative registries (AR), and maintenance technicians. The real-world consequences include double-booked lecture halls, untracked maintenance requests that take weeks to resolve, and a general lack of transparency regarding request statuses.

#### The Solution
Project KNOT is a unified, centralized resource and maintenance management platform. It solves this fragmentation by offering a single, Role-Based Access Control (RBAC) ecosystem with specialized workflows for Students, Lecturers, Booking Admins, Maintenance Admins, and Field Technicians.

---

## Milestone Progress & Implemented Features

### 🔹 Milestone 1: Core Foundation & Architecture
1. **Multi-Role Authentication & Role-Based Access Control (RBAC)**:
   - Built a secure login framework supporting Students, Lecturers, Booking Admins, Maintenance Admins, and Technicians.
2. **Resource Database Schema Normalization**:
   - Initial database design for lecture halls, labs, and seminar rooms with capacity metrics and operational status tracking.
3. **UI Dashboard Framework**:
   - Developed responsive Single Page Application (SPA) layouts using React.js and Tailwind CSS with glassmorphic elements and dark/light modes.

---

### 🔹 Milestone 2: Academic Booking Workflow & Maintenance Reporting
1. **Multi-Tier Academic Approval Workflow**:
   - Implemented 3-stage reservation approval chain: Student Request ➡️ Lecturer Endorsement ➡️ Booking Admin Final Approval.
2. **Basic Fault Reporting Module**:
   - Implemented issue submission features allowing campus users to report infrastructure faults with category tags and priority levels.

---

### 🌟 Milestone 3: Real-Time Availability Grid, Worker Portal, Bulk Schedule Import & System Integration
1. **Bulk Semester Schedule Import Implementation (Dean's Requirement)**:
   - **Master Timetable Ingestion Engine**: Implemented specifically per the Dean's requirement to handle pre-booked master semester timetables.
   - **Automated Validation & Ingestion**: Parses semester schedule files, extracts day/time/hall/lecturer attributes, automatically verifies conflicts against existing database reservations, skips overlapping slots, and bulk-populates recurring semester lectures into the system.

2. **Interactive Real-Time Hall Availability Grid**:
   - Visual hourly slot selection grid (08:00 AM – 06:00 PM) replacing static dropdowns.
   - Real-time database queries displaying booked status badges (`Available`, `Booked: [Purpose]`, `Already Passed`) and preventing double-booking over occupied ranges.

3. **Maintenance Worker Portal Integration & Admin Task Assignment**:
   - **Admin Task Assignment & Dispatch**: Maintenance Admins review fault reports, assign specific technicians (*Alex Johnson*, *Sam Carter*), set priority levels, and attach technical directives.
   - **Technician Task Queue (`TechnicianDashboard`)**: Technicians access a personal, real-time job queue filtering tickets assigned specifically to their ID.
   - **Interactive Task Modal & Evidence Inspector**: Technicians inspect location info, map coordinates, reporter notes, and user evidence photos.
   - **Status Progression & Work Logs**: Technicians update jobs in real-time (`Open` ➡️ `In Progress` ➡️ `Resolved`), add maintenance resolution notes, and upload proof-of-work photos upon completion.

4. **Booking Admin Portal Automated Approval System & Multi-Criteria Filtering**:
   - **Automated Reservation Approval Engine**: Implemented an automated booking approval system in the Booking Admin Portal. When enabled (`auto_booking: true`), routine conflict-free hall booking requests are automatically validated against existing reservations and instantly approved (`Approved`) without administrative delay.
   - **Configurable Control Panel**: Configurable toggle in Booking Admin System Settings with persistent MySQL database state (`settings` table) allowing admins to toggle between automated approvals and manual AR office reviews.
   - **Multi-Criteria Search & Filter**: Filter by Search Text (matching room, lecturer name, user role, or purpose), Multi-Select Room badges (e.g., `EOE Hall`, `DO1`, `Lecture Hall 1`), Quick Date Presets (`Today`, `Tomorrow`, `This Week`, `Future`), Custom Date Ranges, and Status (`Approved`, `Pending AR`, `Pending`, `Rejected`).
   - **Flexible Sorting**: Sort table rows by Date (Newest/Oldest), Lecture Hall Name, or Status.

5. **Semester Timetable Calendar Enhancements**:
   - Native HTML5 datepicker calendar integration.
   - Datepicker-filtered **Agenda View** displaying lectures strictly for selected dates.
   - Dedicated single-room grid timeline view when filtering by a specific hall.
   - Standardized 10 uniform lecture hall names across all UI elements and database schemas (`EOE Hall`, `DO1`, `DO2`, `Lecture Hall 1`, `Lecture Hall 2`, `Seminar Room 1`, `Seminar Room 2`, `Computer Lab 1`, `Computer Lab 2`, `Main Auditorium`).

6. **Maintenance Reporting & Admin Evidence Viewer**:
   - Integrated OpenStreetMap (Leaflet) with reverse geocoding (Nominatim API) and map pin dropping.
   - High-resolution photo evidence upload support with 50MB JSON payload limits.
   - Maintenance Admin Ticket Details view with a dedicated **Evidence Photo Viewer**.

---

## Solution Architecture

Project KNOT utilizes a modern, decoupled Client-Server Architecture to ensure scalability and maintainability.

- **Frontend (Client):** Built using React.js (Vite) and Tailwind CSS for a responsive, modern UI. Utilizes Lucide & Material Symbols icons, Leaflet map components, and local state management for snappy SPA rendering.
- **Backend (Server):** Powered by Node.js and Express.js with a unified proxy gateway (`gateway_server.js`) and RESTful APIs with 50MB payload limits.
- **Database:** MySQL relational database (`knot_db`) normalized into core tables (`users`, `rooms`, `bookings`, `faults`, `settings`) with dynamic schema migration scripts.

---

## Software Designs

#### 3.1 User Interface (UI) Design
The system employs a "View-Based Navigation" architecture. Dashboards utilize dynamic component rendering and RBAC authentication guards to seamlessly mount appropriate interfaces for Students, Lecturers, Booking Admins, Maintenance Admins, and Technicians.

#### 3.2 Database Schema Design
Normalized relational schema:
- **`users`**: RBAC credentials (`id`, `username`, `password`, `name`, `role`, `department`).
- **`rooms`**: Asset management (`id`, `name`, `capacity`, `type`, `status`).
- **`bookings`**: Reservation state (`id`, `title`, `time_display`, `status`, `assigned_lecturer`, `purpose`, `end_time`, `rejection_reason`, `booking_type`).
- **`faults`**: Maintenance tickets (`id`, `title`, `description`, `location`, `priority`, `status`, `photo_url`, `assigned_technician_id`, `maintenance_notes`, `worker_photo`, `admin_verified`).
- **`settings`**: System configurations (`auto_booking` state).

#### 3.3 Business Logic & Workflow Designs
1. **Dean's Bulk Timetable Ingestion**: Booking Admin uploads master schedule file ➡️ Backend parses slots & validates conflicts ➡️ Bulk inserts valid semester lectures into database.
2. **Multi-Criteria Booking Filter & Sort**: Booking Admin toggles room badges, date ranges, and status pills ➡️ Dynamic client-side filter engine updates "All Bookings" table instantly.
3. **Worker Task Assignment**: Maintenance Admin assigns fault ticket ➡️ Assigned Technician views task on Worker Portal, updates status (`In Progress` ➡️ `Resolved`), logs work, and uploads proof photo.

---

## Testing & System Validation

Testing was conducted across all system tiers to validate Milestone 1, 2, and 3 requirements:

- **Bulk Schedule Ingestion Testing**: Uploaded master semester schedule files. Confirmed automated conflict detection skipped double-bookings while bulk-populating valid lectures across all 10 lecture halls.
- **Booking Admin Search & Filter Testing**: Tested multi-select room filtering, date range pickers, and sorting controls on the "All Bookings" tab. Verified fast and precise filtering results.
- **Worker Portal & Task Assignment Testing**: Assigned tickets to technician `Alex Johnson` via Maintenance Admin view. Confirmed real-time delivery to Alex's Worker Portal, validated status transitions (`In Progress` ➡️ `Resolved`), and verified work log sync.
- **Interactive Availability Grid Testing**: Attempted to book occupied slots. The UI grid rendered slots as `Booked` and strictly disallowed overlapping range selections.
- **Photo Evidence & Proof Upload Testing**: Submitted 5MB+ base64 image attachments in fault reports and technician work logs. Confirmed successful database storage and rendering on Admin Ticket Details and Worker views.

---

## Conclusion & Future Work

#### What Was Achieved
We successfully designed, developed, integrated, and validated all three Milestones of Project KNOT. The platform provides a complete academic resource booking system, Dean's bulk semester timetable import, multi-criteria booking search and sorting, a complete Maintenance Worker Portal with admin task assignment, real-time conflict-free hall scheduling, map-integrated fault reporting, and admin evidence inspection.

#### Future Developments
- **Automated Notifications**: Email / SMS alerts for instant status updates.
- **Advanced Analytics**: Visual analytics dashboard for room utilization rates.
- **Mobile Native Apps**: React Native wrappers for iOS & Android.

---

## Links

- [Project Repository](https://github.com/cepdnaclk/e22-co2060-Project-KNOT){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)
