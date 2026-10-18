export interface StudentRemark {
  id: number;
  student_id: number;
  student_name: string;
  author_name: string;
  author_role: 'Class Teacher' | 'Subject Faculty' | 'School Counselor' | 'Principal' | 'Administrator';
  category: 'Academic Excellence' | 'Behavioral & Conduct' | 'Remedial / Focus Area' | 'Special Commendation' | 'Sports & Leadership';
  date: string;
  timestamp: string;
  remark_text: string;
  priority: 'High Attention' | 'Commendation' | 'Routine';
  acknowledged_by_parent: boolean;
  parent_ack_by?: string;
  parent_ack_date?: string;
}

export const initialStudentRemarks: StudentRemark[] = [
  // --- Aarav Sharma (ID: 1) ---
  {
    id: 101,
    student_id: 1,
    student_name: "Aarav Sharma",
    author_name: "Mrs. Ananya Verma",
    author_role: "Class Teacher",
    category: "Academic Excellence",
    date: "16 Oct 2026",
    timestamp: "10:30 AM",
    remark_text: "Aarav shows exceptional analytical curiosity in class discussions. In Mathematics, he is diligent with quadratic problem solving but needs to pay careful attention to sign expansions during step transitions. His peer collaboration in science group projects is commendable.",
    priority: "Routine",
    acknowledged_by_parent: true,
    parent_ack_by: "Mr. Rajesh Sharma",
    parent_ack_date: "17 Oct 2026, 08:45 AM"
  },
  {
    id: 102,
    student_id: 1,
    student_name: "Aarav Sharma",
    author_name: "Ms. Shweta Iyer",
    author_role: "School Counselor",
    category: "Behavioral & Conduct",
    date: "10 Oct 2026",
    timestamp: "02:15 PM",
    remark_text: "Demonstrates high emotional maturity and strong leadership qualities during inter-house robotics competition. Well-balanced demeanor and punctual attendance throughout Term 1.",
    priority: "Commendation",
    acknowledged_by_parent: true,
    parent_ack_by: "Mr. Rajesh Sharma",
    parent_ack_date: "11 Oct 2026, 06:20 PM"
  },
  {
    id: 103,
    student_id: 1,
    student_name: "Aarav Sharma",
    author_name: "Dr. K. Raman",
    author_role: "Subject Faculty",
    category: "Special Commendation",
    date: "28 Sep 2026",
    timestamp: "11:00 AM",
    remark_text: "Outstanding laboratory discipline in optics and electrical circuit experiments. Maintains an exemplary lab journal with accurate ray diagrams and error analysis.",
    priority: "Commendation",
    acknowledged_by_parent: true,
    parent_ack_by: "Mrs. Priya Sharma",
    parent_ack_date: "29 Sep 2026, 09:15 AM"
  },
  {
    id: 104,
    student_id: 1,
    student_name: "Aarav Sharma",
    author_name: "Dr. S. Nair",
    author_role: "Principal",
    category: "Behavioral & Conduct",
    date: "15 Sep 2026",
    timestamp: "04:30 PM",
    remark_text: "A promising student representing Phoenix House with distinction. Encouraged to continue consistent effort across all humanities subjects.",
    priority: "Routine",
    acknowledged_by_parent: false
  },

  // --- Diya Patel (ID: 2) ---
  {
    id: 201,
    student_id: 2,
    student_name: "Diya Patel",
    author_name: "Mrs. Ananya Verma",
    author_role: "Class Teacher",
    category: "Academic Excellence",
    date: "17 Oct 2026",
    timestamp: "11:15 AM",
    remark_text: "Diya is a stellar academic achiever in Class 8-B, currently ranked #2. Her analytical aptitude and debate composition in English and Social Sciences are exemplary. Highly disciplined, respectful, and punctual in every morning assembly.",
    priority: "Commendation",
    acknowledged_by_parent: true,
    parent_ack_by: "Mrs. Sunita Patel",
    parent_ack_date: "18 Oct 2026, 07:30 AM"
  },
  {
    id: 202,
    student_id: 2,
    student_name: "Diya Patel",
    author_name: "Mr. Vikram Joshi",
    author_role: "Subject Faculty",
    category: "Special Commendation",
    date: "12 Oct 2026",
    timestamp: "01:45 PM",
    remark_text: "Consistently scores above 94% in formative assessments. Solves higher-order thinking skill (HOTS) geometry proofs with elegance and speed. Actively assists peers in remedial math doubt clearance.",
    priority: "Commendation",
    acknowledged_by_parent: true,
    parent_ack_by: "Mrs. Sunita Patel",
    parent_ack_date: "13 Oct 2026, 09:10 PM"
  },
  {
    id: 203,
    student_id: 2,
    student_name: "Diya Patel",
    author_name: "Coach Gurpreet Singh",
    author_role: "Subject Faculty",
    category: "Sports & Leadership",
    date: "05 Oct 2026",
    timestamp: "03:50 PM",
    remark_text: "Captained the Junior Girls Basketball team to district semifinals. Exemplary team spirit, discipline, and sportsmanship on and off the court.",
    priority: "Commendation",
    acknowledged_by_parent: false
  },
  {
    id: 204,
    student_id: 2,
    student_name: "Diya Patel",
    author_name: "Dr. S. Nair",
    author_role: "Principal",
    category: "Special Commendation",
    date: "15 Sep 2026",
    timestamp: "04:30 PM",
    remark_text: "Eligible for National Merit Scholarship screening. An asset to Phoenix House and EDU360 Academy.",
    priority: "Commendation",
    acknowledged_by_parent: true,
    parent_ack_by: "Mrs. Sunita Patel",
    parent_ack_date: "16 Sep 2026, 08:15 AM"
  },

  // --- Rohan Deshmukh (ID: 3) ---
  {
    id: 301,
    student_id: 3,
    student_name: "Rohan Deshmukh",
    author_name: "Mrs. Ananya Verma",
    author_role: "Class Teacher",
    category: "Academic Excellence",
    date: "14 Oct 2026",
    timestamp: "09:40 AM",
    remark_text: "Rohan demonstrates sharp computational agility and active classroom participation. Consistently achieves A1 grades in Science and Computer Science.",
    priority: "Routine",
    acknowledged_by_parent: true,
    parent_ack_by: "Dr. Sunil Deshmukh",
    parent_ack_date: "15 Oct 2026, 07:15 PM"
  },
  {
    id: 302,
    student_id: 3,
    student_name: "Rohan Deshmukh",
    author_name: "Ms. Shweta Iyer",
    author_role: "School Counselor",
    category: "Behavioral & Conduct",
    date: "08 Oct 2026",
    timestamp: "02:00 PM",
    remark_text: "Well adjusted, polite, and cooperative with peers. Demonstrates healthy balance between academics and campus robotics workshops.",
    priority: "Routine",
    acknowledged_by_parent: false
  },

  // --- Meera Nambiar (ID: 4) ---
  {
    id: 401,
    student_id: 4,
    student_name: "Meera Nambiar",
    author_name: "Mrs. Ananya Verma",
    author_role: "Class Teacher",
    category: "Academic Excellence",
    date: "15 Oct 2026",
    timestamp: "10:10 AM",
    remark_text: "Meera is expressive and creative in English literature essays. Recommended to maintain a daily revision notebook for physics formulas.",
    priority: "Routine",
    acknowledged_by_parent: true,
    parent_ack_by: "Mrs. Anita Nambiar",
    parent_ack_date: "16 Oct 2026, 06:30 PM"
  },

  // --- Kabir Mehta (ID: 5) ---
  {
    id: 501,
    student_id: 5,
    student_name: "Kabir Mehta",
    author_name: "Mrs. Ananya Verma",
    author_role: "Class Teacher",
    category: "Remedial / Focus Area",
    date: "15 Oct 2026",
    timestamp: "11:30 AM",
    remark_text: "Kabir is currently enrolled in the 4-day Focus Table remedial program. Shows willingness to learn; regular attendance and homework completion will ensure significant grade improvement.",
    priority: "High Attention",
    acknowledged_by_parent: false
  },

  // --- Tanvi Sen (ID: 6) ---
  {
    id: 601,
    student_id: 6,
    student_name: "Tanvi Sen",
    author_name: "Mrs. Ananya Verma",
    author_role: "Class Teacher",
    category: "Academic Excellence",
    date: "16 Oct 2026",
    timestamp: "09:15 AM",
    remark_text: "Exceptional all-rounder. Scored 94% average in Term 1 with top marks in Mathematics and Biology.",
    priority: "Commendation",
    acknowledged_by_parent: true,
    parent_ack_by: "Mrs. Ritu Sen",
    parent_ack_date: "16 Oct 2026, 08:00 PM"
  }
];

export function getRemarksForStudent(studentId: number): StudentRemark[] {
  const filtered = initialStudentRemarks.filter(r => r.student_id === studentId);
  if (filtered.length > 0) return filtered;

  // Fallback remarks for any student
  return [
    {
      id: studentId * 100 + 1,
      student_id: studentId,
      student_name: `Student #${studentId}`,
      author_name: "Mrs. Ananya Verma",
      author_role: "Class Teacher",
      category: "Academic Excellence",
      date: "15 Oct 2026",
      timestamp: "10:00 AM",
      remark_text: "Consistent academic dedication and positive conduct in all classroom activities. Highly receptive to faculty feedback.",
      priority: "Routine",
      acknowledged_by_parent: true,
      parent_ack_by: "Primary Guardian",
      parent_ack_date: "16 Oct 2026, 09:00 AM"
    },
    {
      id: studentId * 100 + 2,
      student_id: studentId,
      student_name: `Student #${studentId}`,
      author_name: "Ms. Shweta Iyer",
      author_role: "School Counselor",
      category: "Behavioral & Conduct",
      date: "04 Oct 2026",
      timestamp: "02:30 PM",
      remark_text: "Demonstrates cooperative demeanor, polite interaction with faculty, and punctual morning reporting.",
      priority: "Routine",
      acknowledged_by_parent: false
    }
  ];
}
