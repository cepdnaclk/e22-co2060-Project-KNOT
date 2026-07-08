-- Create Database
CREATE DATABASE IF NOT EXISTS knot_db;
USE knot_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('Student', 'Lecturer', 'Admin', 'Technician') NOT NULL,
    endorsement_status ENUM('Awaiting Endorsement', 'Lecturer Endorsed', 'None') DEFAULT 'None'
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    floor VARCHAR(50) NOT NULL
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Faults/Maintenance Table
CREATE TABLE IF NOT EXISTS faults (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    reported_by INT NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- Dummy Data for Testing
INSERT INTO users (name, email, role, endorsement_status) VALUES
('Alex Johnson', 'alex@example.com', 'Student', 'Lecturer Endorsed'),
('Dr. Sarah Miller', 'sarah@example.com', 'Lecturer', 'None'),
('Jordan Lee', 'jordan@example.com', 'Student', 'Awaiting Endorsement');

INSERT INTO rooms (name, floor) VALUES
('Design Studio A', '3rd Floor'),
('Main Auditorium', '1st Floor'),
('Media Lab 2', '4th Floor');

INSERT INTO bookings (user_id, room_id, purpose, booking_date, start_time, end_time, status) VALUES
(1, 1, 'Design Workshop', CURDATE(), '14:00:00', '16:00:00', 'Pending'),
(2, 2, 'Guest Lecture', CURDATE() + INTERVAL 1 DAY, '09:00:00', '12:00:00', 'Pending'),
(3, 3, 'Club Meeting', CURDATE() + INTERVAL 2 DAY, '10:00:00', '11:30:00', 'Pending');

INSERT INTO faults (room_id, reported_by, description, status) VALUES
(1, 1, 'Projector not working', 'Pending'),
(2, 2, 'AC malfunctioning', 'In Progress');
