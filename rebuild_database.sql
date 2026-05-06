SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS salary;
DROP TABLE IF EXISTS salaries;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS announcement_reads;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS admins;

-- Users Table (Admin)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('admin', 'employee') DEFAULT 'admin',
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  basic_salary DECIMAL(10,2),
  join_date DATE,
  leave_balance INT DEFAULT 12,
  status ENUM('Active', 'Inactive', 'Terminated') DEFAULT 'Active',
  phone VARCHAR(20),
  address TEXT,
  emergency_contact VARCHAR(100),
  profile_photo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'Late', 'Half Day') DEFAULT 'Present',
  check_in VARCHAR(20),
  check_out VARCHAR(20),
  notes TEXT,
  FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Salary Table
CREATE TABLE salary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  month VARCHAR(20) NOT NULL,
  year INT NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL,
  bonus DECIMAL(10,2) DEFAULT 0,
  overtime DECIMAL(10,2) DEFAULT 0,
  deduction DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  status ENUM('Draft', 'Approved', 'Rejected', 'Paid') DEFAULT 'Draft',
  approved_by INT,
  approved_at TIMESTAMP NULL,
  payment_date DATE,
  remarks TEXT,
  is_modified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Requests Table
CREATE TABLE requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  request_type ENUM('Leave Request', 'Half Day', 'Work From Home', 'Salary Advance', 'Profile Update', 'Casual Leave', 'Sick Leave', 'Emergency Leave', 'Maternity/Paternity') NOT NULL,
  reason TEXT,
  from_date DATE,
  to_date DATE,
  amount DECIMAL(10,2) DEFAULT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  admin_remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Announcements Table
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('Normal', 'Important', 'Urgent') DEFAULT 'Normal',
  target_type ENUM('All Employees', 'Department Wise', 'Specific Employee') DEFAULT 'All Employees',
  target_id VARCHAR(255) DEFAULT NULL,
  publish_date DATE,
  expiry_date DATE,
  attachment VARCHAR(255) DEFAULT NULL,
  status ENUM('Published', 'Draft', 'Expired') DEFAULT 'Published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Announcement Reads Table
CREATE TABLE announcement_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  announcement_id INT NOT NULL,
  employee_id INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Admin User
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@gmail.com', '$2b$10$WeFune.NbI/.5G8sFENPCOUZQhCmmeOJoHq830PzScaeSt9S5HHTe', 'admin');

SET FOREIGN_KEY_CHECKS = 1;
