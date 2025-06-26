-- File: database_setup.sql
-- Run these SQL commands in your MySQL client (like MySQL Workbench or phpMyAdmin) 
-- to create the database and all the necessary tables.

-- 1. Create the database itself
CREATE DATABASE IF NOT EXISTS membership_portal;
USE membership_portal;

-- 2. Create the `regions` table
CREATE TABLE regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the `districts` table
CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    regionId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regionId) REFERENCES regions(id) ON DELETE CASCADE
);

-- 4. Create the `branches` table
CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    regionId INT NOT NULL,
    districtId INT, -- Nullable
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regionId) REFERENCES regions(id) ON DELETE CASCADE,
    FOREIGN KEY (districtId) REFERENCES districts(id) ON DELETE SET NULL
);

-- 5. Create the `users` table for executives
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN', 'BRANCH_ADMIN') NOT NULL,
    regionId INT,
    districtId INT,
    branchId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regionId) REFERENCES regions(id) ON DELETE SET NULL,
    FOREIGN KEY (districtId) REFERENCES districts(id) ON DELETE SET NULL,
    FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE SET NULL
);

-- 6. Create the `members` table
CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    otherNames VARCHAR(255),
    surname VARCHAR(255) NOT NULL,
    dateOfBirth DATE,
    residentialAddress VARCHAR(255),
    contactNumber VARCHAR(50) NOT NULL,
    regionId INT NOT NULL,
    districtId INT,
    branchId INT NOT NULL,
    joinYear INT,
    occupation VARCHAR(255),
    isEmployed BOOLEAN,
    hasChildren BOOLEAN,
    numberOfChildren INT DEFAULT 0,
    childrenInGMM BOOLEAN,
    parentMemberId INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regionId) REFERENCES regions(id),
    FOREIGN KEY (districtId) REFERENCES districts(id),
    FOREIGN KEY (branchId) REFERENCES branches(id),
    FOREIGN KEY (parentMemberId) REFERENCES members(id) ON DELETE SET NULL
);

-- 7. Create the `children` table
CREATE TABLE children (
    id INT AUTO_INCREMENT PRIMARY KEY,
    memberId INT NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    age INT,
    schoolOrProfession VARCHAR(255),
    telephoneNumber VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
);