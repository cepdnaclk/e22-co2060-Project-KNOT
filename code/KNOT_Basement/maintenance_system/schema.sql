CREATE DATABASE IF NOT EXISTS knot_maintenance;
USE knot_maintenance;

CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Resolved') DEFAULT 'Open',
    reported_by VARCHAR(100),
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    maintenance_notes TEXT,
    category VARCHAR(100),
    photo_url VARCHAR(255)
);

-- Insert some seed data to match the mockups
INSERT INTO tickets (ticket_number, title, description, location, priority, status, reported_by, reported_at, maintenance_notes, category) 
VALUES 
('KNT-1024', 'Projector lamp failure in AV system', 'Projector lamp failure in AV system', 'EOE Hall - Main Entrance', 'High', 'In Progress', 'Prof. Sarah Jenkins', '2023-10-24 09:15:00', 'Technician arrived at site. Confirmed the primary lamp module has reached end of life. Attempted a reset but hardware failure persists. Spare lamp (Model-X400) has been requested from inventory. Estimated replacement time: 20 mins once part arrives.', 'Electrical Issues'),
('KNT-1025', 'Broken height adjustment on desk #42', 'Broken height adjustment on desk #42', 'D01 Seminar Room', 'Medium', 'Open', 'John Doe', '2023-10-24 10:30:00', '', 'Furniture Repairs'),
('KNT-1026', 'Flickering overhead light in aisle D', 'Flickering overhead light in aisle D', 'Library Level 2', 'Low', 'Open', 'Maintenance Bot', '2023-10-24 07:00:00', '', 'Electrical Issues'),
('KNT-1027', 'Water leak detected near refrigeration unit', 'Water leak detected near refrigeration unit', 'Cafeteria Annex', 'High', 'Open', 'Facility Manager', '2023-10-24 11:45:00', '', 'HVAC Maintenance');
