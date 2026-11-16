# -*- coding: utf-8 -*-
with open('frontend/src/components/notification-center.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [userId, role]);"""

replacement = """  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s

    // Real-time synchronization for Coordinator Exam Schedules & Duty Allocations
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined') {
        channel = new BroadcastChannel('edu360_exam_live_channel');
        channel.onmessage = (e) => {
          if (e.data?.type === 'EXAM_SCHEDULED' || e.data?.type === 'DUTY_ASSIGNED' || e.data?.type === 'HALL_TICKETS_RELEASED') {
            fetchNotifications();
          }
        };
      }
    } catch {}

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
    };
  }, [userId, role]);"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('frontend/src/components/notification-center.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("notification-center.tsx patched successfully.")
else:
    print("Target not found in notification-center.tsx")
