-- PROSPECT - Football Scouting Notebook
-- Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS prospect_db;
USE prospect_db;

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    dob DATE,
    age INT,
    nationality VARCHAR(100),
    height INT,
    position VARCHAR(20),
    secondaryPosition VARCHAR(20),
    preferredFoot VARCHAR(20),
    identificationNumber VARCHAR(50),
    club VARCHAR(255),
    currentTeam VARCHAR(255),
    notes TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    INDEX idx_player_name (name),
    INDEX idx_player_position (position),
    INDEX idx_player_club (club),
    INDEX idx_player_created (createdAt)
);

-- Scouting reports table
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    playerId VARCHAR(50) NOT NULL,
    playerName VARCHAR(255),
    date DATE,
    attributes JSON,
    attributeNotes JSON,
    strengths TEXT,
    weaknesses TEXT,
    summary TEXT,
    recommendation VARCHAR(100),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_report_player (playerId),
    INDEX idx_report_date (date),
    INDEX idx_report_created (createdAt)
);

-- Match observations table
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(50) PRIMARY KEY,
    opponent VARCHAR(255) NOT NULL,
    competition VARCHAR(255),
    date DATE,
    venue VARCHAR(255),
    playerId VARCHAR(50) NOT NULL,
    positionPlayed VARCHAR(20),
    minutesPlayed INT,
    rating INT,
    keyObservations TEXT,
    strengths TEXT,
    weaknesses TEXT,
    areasForImprovement TEXT,
    pitchData JSON,
    createdAt DATETIME NOT NULL,
    FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_match_player (playerId),
    INDEX idx_match_opponent (opponent),
    INDEX idx_match_date (date),
    INDEX idx_match_created (createdAt)
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    content TEXT NOT NULL,
    category VARCHAR(100),
    playerId VARCHAR(50),
    tags VARCHAR(255),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE SET NULL,
    INDEX idx_note_title (title),
    INDEX idx_note_category (category),
    INDEX idx_note_player (playerId),
    INDEX idx_note_created (createdAt)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(50),
    key VARCHAR(100) NOT NULL,
    value TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    UNIQUE KEY uk_user_key (userId, key),
    INDEX idx_setting_key (key)
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entityId VARCHAR(50),
    details TEXT,
    timestamp DATETIME NOT NULL,
    INDEX idx_activity_user (userId),
    INDEX idx_activity_type (type),
    INDEX idx_activity_entity (entity),
    INDEX idx_activity_timestamp (timestamp)
);

-- Users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'scout',
    lastLogin DATETIME,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    INDEX idx_user_email (email)
);

-- Sync status table (for tracking sync state)
CREATE TABLE IF NOT EXISTS sync_status (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    deviceId VARCHAR(100),
    lastSync DATETIME,
    syncToken VARCHAR(255),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sync_user (userId),
    INDEX idx_sync_device (deviceId),
    INDEX idx_sync_token (syncToken)
);
