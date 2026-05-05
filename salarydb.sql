CREATE DATABASE salarydb1;
USE salarydb;

CREATE TABLE admins (
 id INT AUTO_INCREMENT PRIMARY KEY,
 email VARCHAR(100),
 password VARCHAR(255)
);

CREATE TABLE employees (
 id INT AUTO_INCREMENT PRIMARY KEY,
 full_name VARCHAR(100),
 email VARCHAR(100),
 phone VARCHAR(20),
 department VARCHAR(50),
 designation VARCHAR(50),
 joining_date DATE,
 basic_salary DECIMAL(10,2)
);

INSERT INTO admins (email,password)
VALUES ('admin@gmail.com','123456');