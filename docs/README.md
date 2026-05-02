---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: eYY-co2060-project-template
title: Project Template
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

<!-- Once you fill the index.json file inside /docs/data, please make sure the syntax is correct. (You can use this tool to identify syntax errors)

Please include the "correct" email address of your supervisors. (You can find them from https://people.ce.pdn.ac.lk/ )

Please include an appropriate cover page image ( cover_page.jpg ) and a thumbnail image ( thumbnail.jpg ) in the same folder as the index.json (i.e., /docs/data ). The cover page image must be cropped to 940×352 and the thumbnail image must be cropped to 640×360 . Use https://croppola.com/ for cropping and https://squoosh.app/ to reduce the file size.

If your followed all the given instructions correctly, your repository will be automatically added to the department's project web site (Update daily)

A HTML template integrated with the given GitHub repository templates, based on github.com/cepdnaclk/eYY-project-theme . If you like to remove this default theme and make your own web page, you can remove the file, docs/_config.yml and create the site using HTML. -->

# Project KNOT

---

## Team
-  E/22/237, M. F. M. Minhaj Ali, [e22237@eng.pdn.ac.lk](mailto:e22237@eng.pdn.ac.lk)
-  E/22/366, M. D. S. Senanayake, [e22366@eng.pdn.ac.lk](mailto:e22366@eng.pdn.ac.lk)
-  E/22/280, H. C. V. Perera, [e22280@eng.pdn.ac.lk](mailto:e22280@eng.pdn.ac.lk)
-  E/22/443, W. M. E. N. Wijesinghe, [e22443@eng.pdn.ac.lk](mailto:e22443@eng.pdn.ac.lk)

## Supervisor
-  Prof. Roshan G. Ragel, [roshanr@eng.pdn.ac.lk](mailto:e22237@eng.pdn.ac.lk)

<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#hardware-and-software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

#### The Problem
Universities and large educational institutions often suffer from highly fragmented administrative systems. Currently, the processes for booking academic resources (such as lecture halls, labs, and seminar rooms) and reporting infrastructure faults are disconnected. This leads to severe coordination issues between students, academic staff (lecturers), administrative registries (AR), and maintenance technicians. The real-world consequences include double-booked lecture halls, untracked maintenance requests that take weeks to resolve, and a general lack of transparency regarding the status of requests.

#### The Solution
Project KNOT is a unified, centralized resource and maintenance management platform. It solves this fragmentation by offering a single, Role-Based Access Control (RBAC) ecosystem.

-  For Bookings: It introduces a multi-tier endorsement workflow where students can request rooms, lecturers can endorse them, and Booking Admins can finalize the schedule—all backed by an automated conflict-prevention engine.
-  For Maintenance: It provides a streamlined ticketing system where users can report faults and technicians can provide live updates and resolution notes.
Impact
KNOT significantly reduces administrative overhead and eliminates scheduling conflicts. By providing a transparent, real-time tracking system, it improves communication between departments, accelerates maintenance response times, and ensures university assets are utilized optimally.




## Solution Architecture

Project KNOT utilizes a modern, decoupled Client-Server Architecture to ensure scalability and maintainability.

-  Frontend (Client): Built using React.js to create a snappy Single Page Application (SPA). It uses Tailwind CSS for a responsive, modern UI design. The frontend manages state locally to provide instant feedback without requiring full page reloads.
-  Backend (Server): Powered by Node.js and Express.js. The backend acts as a unified RESTful API gateway, securely handling business logic, user authentication, and data validation.
-  Database: A MySQL relational database is used for persistent data storage, ensuring data integrity across complex relationships (e.g., linking bookings to specific users and endorsing lecturers).

## Software Designs

#### 3.1 User Interface (UI) Design
The system employs a "View-Based Navigation" architecture. Rather than building completely separate physical pages, the dashboards utilize dynamic component rendering to seamlessly switch between views (e.g., switching from "Pending Approvals" to "Room Management"). The UI relies heavily on conditional rendering to display specific tools based on the user's role (Student, Lecturer, Booking Admin, Maintenance Admin).

#### 3.2 Database Schema Design
The relational database is normalized into four primary tables:

-  users: Manages RBAC credentials. Fields include username, password, role, and department.
-  rooms: Manages physical assets. Fields include name, capacity, type, and operational status (Available/Maintenance).
-  bookings: Tracks reservation state. Fields include time_display, assigned_lecturer, an overarching status, and rejection_reason for feedback.
-  faults: Tracks maintenance tickets. Fields include priority, location, status, and technician maintenance_notes.
  
#### 3.3 Business Logic & Workflow Design
The core software design revolves around the Multi-Tier Endorsement Workflow.

1. Initiation: Student creates a booking.
2. Academic Filter: If an assigned_lecturer is tagged, the request sits in a Pending state visible only to that lecturer.
3. Administrative Filter: Once the lecturer approves, the state shifts to Pending AR, passing it to the Booking Admin queue.
4. Validation: The backend executes a strict conflict-prevention algorithm checking against existing Approved records for the same room and time before finalizing the booking.

## Testing

Testing was conducted across multiple layers of the application to ensure a stable Minimum Viable Product (MVP).

#### Summarized Results
-  Functional / API Testing: We rigorously tested the REST endpoints. Specifically, the double-booking validation algorithm was tested by attempting to approve overlapping requests. The backend successfully caught the overlap and returned the expected 409 Conflict HTTP status code.
-  UI/UX & State Testing: Tested the dynamic state management of the React dashboards. Verified that rejection notes typed by an admin immediately and accurately populate on the requesting student's dashboard.
-  Role-Based Access Testing: Verified that the authentication gateway successfully parses user credentials and mounts the correct dashboard component (e.g., ensuring a student cannot access the AR portal).
-  End-to-End Workflow: Successfully simulated the full lifecycle of a booking from Student creation ➡️ Lecturer Endorsement ➡️ Booking Admin Approval without data loss.


## Conclusion

#### What Was Achieved
We successfully designed, developed, and deployed the MVP of Project KNOT. We transitioned a set of fragmented, disparate systems into a single, cohesive platform. We achieved our primary goal of establishing a secure, role-based ecosystem that handles complex academic booking workflows and real-time maintenance ticketing seamlessly.

#### Future Developments
While the MVP is fully functional, future iterations of Project KNOT will aim to include:

-  Automated Notifications: Integrating an email or SMS gateway to alert users instantly when their booking status changes or a fault is resolved.
-  Interactive Map Integrations: Allowing students to select rooms or drop pins for fault locations on a visual, interactive campus map.
-  Advanced Analytics: Building visual reporting charts for Booking Admins to analyze room utilization rates over a semester.
  
#### Commercialization Plans
Project KNOT's flexible RBAC architecture makes it highly adaptable. Beyond our university, the platform can be white-labeled and licensed as a B2B Software-as-a-Service (SaaS) product. Target markets include other universities, large corporate campuses, or co-working spaces that require internal oversight for shared resources and facility maintenance.



## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
