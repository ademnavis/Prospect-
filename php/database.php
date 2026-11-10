<?php
// PROSPECT - Football Scouting Notebook
// Database Connection File

require_once __DIR__ . '/config.php';

class Database {
    private $connection;
    
    public function __construct() {
        $this->connect();
    }
    
    private function connect() {
        try {
            $this->connection = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database query error: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function fetch($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }
    
    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }
    
    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
        
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($data);
            return $this->connection->lastInsertId();
        } catch (PDOException $e) {
            error_log("Database insert error: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function update($table, $data, $where) {
        $set = [];
        foreach ($data as $key => $value) {
            $set[] = "$key = :$key";
        }
        $set = implode(', ', $set);
        
        $whereClause = [];
        foreach ($where as $key => $value) {
            $whereClause[] = "$key = :where_$key";
            $data["where_$key"] = $value;
        }
        $whereClause = implode(' AND ', $whereClause);
        
        $sql = "UPDATE $table SET $set WHERE $whereClause";
        
        try {
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($data);
        } catch (PDOException $e) {
            error_log("Database update error: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function delete($table, $where) {
        $whereClause = [];
        $params = [];
        foreach ($where as $key => $value) {
            $whereClause[] = "$key = :$key";
            $params[":$key"] = $value;
        }
        $whereClause = implode(' AND ', $whereClause);
        
        $sql = "DELETE FROM $table WHERE $whereClause";
        
        try {
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Database delete error: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    public function commit() {
        return $this->connection->commit();
    }
    
    public function rollback() {
        return $this->connection->rollBack();
    }
}

// Create database instance
$db = new Database();
