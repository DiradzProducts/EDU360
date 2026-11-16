# -*- coding: utf-8 -*-
import sqlite3

def seed_invigilation_task():
    conn = sqlite3.connect('backend/edu360.db')
    cursor = conn.cursor()
    
    # Check if invigilation task already exists
    cursor.execute("SELECT id FROM admin_tasks WHERE title LIKE '%Invigilation Duty%' AND assigned_to LIKE '%Verma%'")
    row = cursor.fetchone()
    
    if not row:
        cursor.execute("""
            INSERT INTO admin_tasks (
                title, description, category, domain, due_date, 
                assigned_to, assigned_to_role, created_by_name, created_by_role, 
                sla_hours, priority, status
            ) VALUES (
                'Invigilation Duty: Mathematics Midterm Examination (Class 8-B)',
                'Deploy to Virtual Room Alpha. Verify candidate Hall Tickets, monitor edge YOLO v8 telemetry, and sign the Proctor Analysis Sheet for official Gradebook sync.',
                'urgent', 'academic', '2026-11-12',
                'Mrs. Ananya Verma', 'teacher', 'Mrs. Shweta Sengupta', 'exam_coordinator',
                24, 'High', 'pending'
            )
        """)
        print("Inserted Invigilation Duty task for Mrs. Ananya Verma.")
    else:
        print(f"Invigilation Duty task already exists with ID: {row[0]}")
        
    # Also check notification
    cursor.execute("SELECT id FROM notifications WHERE title LIKE '%Invigilation Duty%'")
    notif = cursor.fetchone()
    if not notif:
        cursor.execute("""
            INSERT INTO notifications (
                recipient_role, sender_name, sender_role, title, message,
                notification_type, priority, is_read, action_url, created_at
            ) VALUES (
                'teacher', 'Mrs. Shweta Sengupta', 'exam_coordinator',
                'Invigilation Duty Assigned: Class 8-B Mathematics Midterm',
                'You are assigned as Chief Invigilator for Class 8-B Mathematics Midterm Examination in Virtual Room Alpha. Candidate Hall Tickets issued. Be ready to initiate the Live AI Proctor Room.',
                'DUTY_ASSIGNED', 'URGENT', 0, '/teacher', '2026-11-11 11:30:00'
            )
        """)
        print("Inserted Invigilation Duty notification for teacher.")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    seed_invigilation_task()
