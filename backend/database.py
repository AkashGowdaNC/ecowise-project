"""
Simple SQLite database for EcoWise
No extra installations needed!
"""

import sqlite3
import os
from datetime import datetime

class EcoWiseDB:
    def __init__(self):
        self.db_path = 'ecowise.db'
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                eco_points INTEGER DEFAULT 0,
                level TEXT DEFAULT 'Eco Beginner',
                items_recycled INTEGER DEFAULT 0,
                carbon_saved_kg REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Recycling history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recycling_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                filename TEXT NOT NULL,
                detected_objects TEXT,
                eco_points_earned INTEGER,
                recommendations TEXT,
                processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Insert default user if not exists
        cursor.execute('''
            INSERT OR IGNORE INTO users (username, email, eco_points, level, items_recycled, carbon_saved_kg)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('EcoStudent', 'eco@example.com', 150, 'Eco Warrior', 15, 45.5))
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully!")
    
    def get_user(self, username):
        """Get user by username"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM users WHERE username = ?
        ''', (username,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'eco_points': user[3],
                'level': user[4],
                'items_recycled': user[5],
                'carbon_saved_kg': user[6],
                'created_at': user[7]
            }
        return None
    
    def update_user_points(self, username, points_earned, items_count):
        """Update user's points and stats after recycling"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calculate carbon saved (estimate: 2kg per item)
        carbon_saved = items_count * 2
        
        cursor.execute('''
            UPDATE users 
            SET eco_points = eco_points + ?,
                items_recycled = items_recycled + ?,
                carbon_saved_kg = carbon_saved_kg + ?
            WHERE username = ?
        ''', (points_earned, items_count, carbon_saved, username))
        
        # Update level based on points
        cursor.execute('''
            UPDATE users 
            SET level = CASE
                WHEN eco_points >= 500 THEN 'Eco Champion'
                WHEN eco_points >= 200 THEN 'Eco Warrior' 
                WHEN eco_points >= 100 THEN 'Eco Friend'
                ELSE 'Eco Beginner'
            END
            WHERE username = ?
        ''', (username,))
        
        conn.commit()
        conn.close()
        return True
    
    def add_recycling_history(self, username, filename, detected_objects, points_earned, recommendations):
        """Add recycling activity to history"""
        user = self.get_user(username)
        if not user:
            return False
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Convert objects and recommendations to strings for storage
        detected_str = str(detected_objects)
        recommendations_str = str(recommendations)
        
        cursor.execute('''
            INSERT INTO recycling_history (user_id, filename, detected_objects, eco_points_earned, recommendations)
            VALUES (?, ?, ?, ?, ?)
        ''', (user['id'], filename, detected_str, points_earned, recommendations_str))
        
        conn.commit()
        conn.close()
        return True
    
    def get_user_history(self, username, limit=5):
        """Get user's recent recycling history"""
        user = self.get_user(username)
        if not user:
            return []
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT filename, detected_objects, eco_points_earned, processed_at
            FROM recycling_history 
            WHERE user_id = ?
            ORDER BY processed_at DESC
            LIMIT ?
        ''', (user['id'], limit))
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'filename': row[0],
                'detected_objects': row[1],
                'points_earned': row[2],
                'processed_at': row[3]
            })
        
        conn.close()
        return history

# Create global database instance
db = EcoWiseDB()