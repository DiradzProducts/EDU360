'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  MessageSquareQuote,
  Plus,
  Check,
  Filter,
  ShieldCheck, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  Bus, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  HeartPulse, 
  Download, 
  MessageSquare, 
  Video, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Sparkles,
  Printer,
  Calendar,
  Clock,
  Navigation,
  FileCheck,
  ChevronRight,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { Footer } from '@/components/footer';
import { StudentRemark, getRemarksForStudent } from '@/lib/student-remarks';

interface StudentDossier {
  id: number;
  name: string;
  roll_no: string;
  class_name: string;
  adm_no: string;
  cbse_reg_no: string;
  pen_number: string;
  dob: string;
  gender: string;
  house: string;
  house_color: string;
  attendance_pct: number;
  academic_average_pct: number;
  class_rank: string;
  board_eligible: boolean;
  father: {
    name: string;
    phone: string;
    email: string;
    occupation: string;
    is_primary: boolean;
  };
  mother: {
    name: string;
    phone: string;
    email: string;
    occupation: string;
    authorized_pickup: boolean;
  };
  residential_address: {
    street: string;
    area: string;
    city: string;
    pin: string;
    commute_distance: string;
  };
  medical: {
    blood_group: string;
    allergies: string;
    dietary: string;
    emergency_physician: string;
    physician_phone: string;
    asthma_clearance: string;
  };
  bus_fleet: {
    route_name: string;
    bus_number: string;
    driver_name: string;
    driver_phone: string;
    designated_stop: string;
    pickup_time: string;
    drop_time: string;
    live_speed: string;
    current_gps_status: string;
  };
  academic_subjects: {
    subject: string;
    term1_marks: number;
    term2_marks: number;
    max_marks: number;
    grade: string;
    status: 'Exemplary' | 'Consistent' | 'Focus Area';
    remarks: string;
  }[];
  biometric_swipes: {
    date: string;
    in_time: string;
    out_time: string;
    terminal: string;
    status: 'On-Time' | 'Grace' | 'Late';
  }[];
  documents: {
    id: number;
    title: string;
    doc_type: string;
    uploaded_at: string;
    seal: string;
    sha256: string;
    download_url: string;
  }[];
}

const studentDirectory: Record<number, StudentDossier> = {
  1: {
    id: 1,
    name: "Aarav Sharma",
    roll_no: "01",
    class_name: "Class 8-B",
    adm_no: "EDU-2024-001",
    cbse_reg_no: "CBSE/2026/8B/01",
    pen_number: "PEN-994821034",
    dob: "14 May 2012",
    gender: "Male",
    house: "Phoenix House (Gold)",
    house_color: "from-amber-500 to-yellow-600",
    attendance_pct: 91.4,
    academic_average_pct: 74.2,
    class_rank: "#12 in Class 8-B",
    board_eligible: true,
    father: {
      name: "Mr. Rajesh Sharma",
      phone: "+91 98450 12345",
      email: "guardian.aarav@gmail.com",
      occupation: "Senior Technical Architect, Infosys",
      is_primary: true
    },
    mother: {
      name: "Mrs. Priya Sharma",
      phone: "+91 98450 54321",
      email: "mother.aarav@gmail.com",
      occupation: "Chartered Accountant",
      authorized_pickup: true
    },
    residential_address: {
      street: "Flat 402, Palm Meadows Greens",
      area: "Varthur Main Road, Whitefield",
      city: "Bengaluru, Karnataka",
      pin: "560066",
      commute_distance: "4.8 km to campus"
    },
    medical: {
      blood_group: "O+ (Positive)",
      allergies: "None recorded",
      dietary: "Pure Vegetarian",
      emergency_physician: "Dr. M. Gupta (Apollo Clinic)",
      physician_phone: "+91 80 2345 6709",
      asthma_clearance: "Clear (No inhaler required)"
    },
    bus_fleet: {
      route_name: "Route B-12 (Whitefield Express)",
      bus_number: "KA-01-ED-3601",
      driver_name: "Mr. Ramesh Kumar",
      driver_phone: "+91 98450 77112",
      designated_stop: "Palm Meadows Main Gate",
      pickup_time: "07:35 AM",
      drop_time: "03:45 PM",
      live_speed: "34 km/h (In Transit)",
      current_gps_status: "Green / Geo-fenced On Route"
    },
    academic_subjects: [
      { subject: "Mathematics", term1_marks: 38, term2_marks: 42, max_marks: 50, grade: "B1", status: "Focus Area", remarks: "Active in 4-day Focus Plan for quadratic roots." },
      { subject: "Science (Physics/Chem/Bio)", term1_marks: 44, term2_marks: 46, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Strong experimental and lab observation skills." },
      { subject: "English Language & Literature", term1_marks: 46, term2_marks: 45, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Excellent essay composition and vocabulary." },
      { subject: "Social Science", term1_marks: 40, term2_marks: 41, max_marks: 50, grade: "B1", status: "Consistent", remarks: "Good map work; needs focus on historical timelines." },
      { subject: "Hindi Course B", term1_marks: 42, term2_marks: 44, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Solid grammar and comprehension proficiency." },
      { subject: "Computer Applications / AI", term1_marks: 48, term2_marks: 49, max_marks: 50, grade: "A1", status: "Exemplary", remarks: "Outstanding algorithmic and Python problem solving." }
    ],
    biometric_swipes: [
      { date: "Today (18 Oct 2026)", in_time: "08:14 AM", out_time: "In Session", terminal: "RFID Gate 1 (North)", status: "On-Time" },
      { date: "17 Oct 2026", in_time: "08:18 AM", out_time: "03:32 PM", terminal: "RFID Gate 1 (North)", status: "On-Time" },
      { date: "16 Oct 2026", in_time: "08:12 AM", out_time: "03:30 PM", terminal: "RFID Gate 2 (Turnstile)", status: "On-Time" },
      { date: "15 Oct 2026", in_time: "08:24 AM", out_time: "03:35 PM", terminal: "RFID Gate 1 (North)", status: "Grace" },
      { date: "14 Oct 2026", in_time: "08:10 AM", out_time: "03:30 PM", terminal: "RFID Gate 1 (North)", status: "On-Time" }
    ],
    documents: [
      { id: 1, title: "Official Bonafide Certificate (AY 2026-27)", doc_type: "Bonafide", uploaded_at: "10 Aug 2026", seal: "EDU360 Official Seal - Reg #9921", sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", download_url: "/documents/bonafide_aarav_sharma.pdf" },
      { id: 2, title: "Consolidated Term 1 CBSE Marks Memo", doc_type: "Marks Card", uploaded_at: "02 Oct 2026", seal: "EDU360 Examination Controller Seal", sha256: "7d793037a0760186574b0282f2f435e70d63877d7f6899e72c0385419addfc26", download_url: "/documents/term1_marks_aarav_sharma.pdf" },
      { id: 3, title: "Municipal Corporation Birth Certificate Copy", doc_type: "Birth Certificate", uploaded_at: "15 Jun 2024", seal: "Registrar Verification Stamp", sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", download_url: "/documents/birth_cert_aarav.pdf" },
      { id: 4, title: "Immunization & Medical Fitness Record", doc_type: "Medical Clearance", uploaded_at: "12 Jul 2024", seal: "Apollo Clinic Health Clearance", sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", download_url: "/documents/immunization_aarav.pdf" }
    ]
  },
  2: {
    id: 2,
    name: "Diya Patel",
    roll_no: "18",
    class_name: "Class 8-B",
    adm_no: "EDU-2024-002",
    cbse_reg_no: "CBSE/2026/8B/18",
    pen_number: "PEN-994821035",
    dob: "22 Sep 2012",
    gender: "Female",
    house: "Phoenix House (Gold)",
    house_color: "from-amber-500 to-yellow-600",
    attendance_pct: 96.0,
    academic_average_pct: 88.5,
    class_rank: "#2 in Class 8-B",
    board_eligible: true,
    father: {
      name: "Mrs. Sunita Patel",
      phone: "+91 98222 11111",
      email: "guardian.diya@gmail.com",
      occupation: "Senior Director, Biocon",
      is_primary: true
    },
    mother: {
      name: "Mrs. Priya Patel",
      phone: "+91 98450 22222",
      email: "mother.diya@gmail.com",
      occupation: "Principal Architect, Studio D",
      authorized_pickup: true
    },
    residential_address: {
      street: "#402, Palm Meadows Greens",
      area: "Varthur Main Road, Whitefield",
      city: "Bengaluru, Karnataka",
      pin: "560066",
      commute_distance: "4.8 km to campus"
    },
    medical: {
      blood_group: "O+ (Positive)",
      allergies: "None recorded",
      dietary: "Pure Vegetarian",
      emergency_physician: "Dr. M. Gupta (Apollo Clinic)",
      physician_phone: "+91 80 2345 6709",
      asthma_clearance: "Asthmatic Inhaler Not Required"
    },
    bus_fleet: {
      route_name: "Commute Route Zone B-12",
      bus_number: "KA-01-ED-3612",
      driver_name: "Mr. Manjunath Gowda",
      driver_phone: "+91 98451 44550",
      designated_stop: "Palm Meadows Varthur Gate",
      pickup_time: "07:40 AM",
      drop_time: "03:50 PM",
      live_speed: "32 km/h (On Route)",
      current_gps_status: "Green / Accurate Telemetry"
    },
    academic_subjects: [
      { subject: "Mathematics", term1_marks: 47, term2_marks: 48, max_marks: 50, grade: "A1", status: "Exemplary", remarks: "Exceptional analytical reasoning and geometry proofs." },
      { subject: "Science (Physics/Chem/Bio)", term1_marks: 48, term2_marks: 49, max_marks: 50, grade: "A1", status: "Exemplary", remarks: "Topped Olympiad qualifying round." },
      { subject: "English Language & Literature", term1_marks: 46, term2_marks: 47, max_marks: 50, grade: "A1", status: "Exemplary", remarks: "Outstanding debate and critical writing." },
      { subject: "Social Science", term1_marks: 44, term2_marks: 45, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Thorough understanding of Indian constitution and geography." },
      { subject: "Hindi Course B", term1_marks: 43, term2_marks: 45, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Fluent written composition." },
      { subject: "Computer Applications / AI", term1_marks: 50, term2_marks: 49, max_marks: 50, grade: "A1", status: "Exemplary", remarks: "Completed Python data structures capstone early." }
    ],
    biometric_swipes: [
      { date: "Today (18 Oct 2026)", in_time: "08:08 AM", out_time: "In Session", terminal: "RFID Gate 1 (North)", status: "On-Time" },
      { date: "17 Oct 2026", in_time: "08:10 AM", out_time: "03:30 PM", terminal: "RFID Gate 1 (North)", status: "On-Time" },
      { date: "16 Oct 2026", in_time: "08:05 AM", out_time: "03:30 PM", terminal: "RFID Gate 1 (North)", status: "On-Time" },
      { date: "15 Oct 2026", in_time: "08:12 AM", out_time: "03:32 PM", terminal: "RFID Gate 1 (North)", status: "On-Time" },
      { date: "14 Oct 2026", in_time: "08:09 AM", out_time: "03:30 PM", terminal: "RFID Gate 1 (North)", status: "On-Time" }
    ],
    documents: [
      { id: 1, title: "Official Bonafide Certificate (AY 2026-27)", doc_type: "Bonafide", uploaded_at: "08 Aug 2026", seal: "EDU360 Official Seal - Reg #9922", sha256: "b4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afb", download_url: "/documents/bonafide_diya_patel.pdf" },
      { id: 2, title: "Consolidated Term 1 CBSE Marks Memo", doc_type: "Marks Card", uploaded_at: "02 Oct 2026", seal: "EDU360 Examination Controller Seal", sha256: "f2f435e70d63877d7f6899e72c0385419addfc267d793037a0760186574b0282", download_url: "/documents/term1_marks_diya_patel.pdf" },
      { id: 3, title: "Municipal Corporation Birth Certificate Copy", doc_type: "Birth Certificate", uploaded_at: "18 Jun 2024", seal: "Registrar Verification Stamp", sha256: "a3bf4f1b2b0b822cd15d6c15b0f00a089f86d081884c7d659a2feaa0c55ad015", download_url: "/documents/birth_cert_diya.pdf" },
      { id: 4, title: "Immunization & Medical Fitness Record", doc_type: "Medical Clearance", uploaded_at: "15 Jul 2024", seal: "Apollo Clinic Health Clearance", sha256: "73603d0d6aabbdd62a11ef721d1542d85e884898da28047151d0e56f8dc62927", download_url: "/documents/immunization_diya.pdf" }
    ]
  },
  3: {
    id: 3,
    name: "Rohan Deshmukh",
    roll_no: "14",
    class_name: "Class 8-B",
    adm_no: "EDU-2024-003",
    cbse_reg_no: "CBSE/2026/8B/14",
    pen_number: "PEN-994821036",
    dob: "05 Mar 2012",
    gender: "Male",
    house: "Garuda House (Emerald)",
    house_color: "from-emerald-500 to-teal-600",
    attendance_pct: 95.0,
    academic_average_pct: 86.5,
    class_rank: "#4 in Class 8-B",
    board_eligible: true,
    father: {
      name: "Dr. Sunil Deshmukh",
      phone: "+91 98450 99881",
      email: "guardian.rohan@gmail.com",
      occupation: "Cardiologist, Manipal Hospital",
      is_primary: true
    },
    mother: {
      name: "Dr. Rohini Deshmukh",
      phone: "+91 98450 99884",
      email: "mother.rohan@gmail.com",
      occupation: "Pediatrician",
      authorized_pickup: true
    },
    residential_address: {
      street: "Villa 12, Sobha Windfall",
      area: "Sarjapur Road",
      city: "Bengaluru, Karnataka",
      pin: "560035",
      commute_distance: "6.2 km to campus"
    },
    medical: {
      blood_group: "B+ (Positive)",
      allergies: "Peanuts (Mild)",
      dietary: "Non-Vegetarian",
      emergency_physician: "Dr. Sunil Deshmukh (Father)",
      physician_phone: "+91 98450 99881",
      asthma_clearance: "Clear"
    },
    bus_fleet: {
      route_name: "Route S-04 (Sarjapur Express)",
      bus_number: "KA-01-ED-3604",
      driver_name: "Mr. Suresh Yadav",
      driver_phone: "+91 98450 11993",
      designated_stop: "Sobha Windfall Main Gate",
      pickup_time: "07:25 AM",
      drop_time: "03:55 PM",
      live_speed: "38 km/h (Normal Transit)",
      current_gps_status: "Green / On Schedule"
    },
    academic_subjects: [
      { subject: "Mathematics", term1_marks: 46, term2_marks: 47, max_marks: 50, grade: "A1", status: "Exemplary", remarks: "Great problem solving skills." },
      { subject: "Science (Physics/Chem/Bio)", term1_marks: 45, term2_marks: 46, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Very active in biology practicals." },
      { subject: "English Language & Literature", term1_marks: 42, term2_marks: 44, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Consistent language comprehension." },
      { subject: "Social Science", term1_marks: 43, term2_marks: 45, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Good grasp of civics and geography." },
      { subject: "Hindi Course B", term1_marks: 40, term2_marks: 42, max_marks: 50, grade: "B1", status: "Consistent", remarks: "Needs more vocabulary practice." },
      { subject: "Computer Applications / AI", term1_marks: 47, term2_marks: 48, max_marks: 50, grade: "A1", status: "Exemplary", remarks: "Quick in robotics and logic coding." }
    ],
    biometric_swipes: [
      { date: "Today (18 Oct 2026)", in_time: "08:12 AM", out_time: "In Session", terminal: "RFID Gate 1", status: "On-Time" },
      { date: "17 Oct 2026", in_time: "08:14 AM", out_time: "03:30 PM", terminal: "RFID Gate 1", status: "On-Time" }
    ],
    documents: [
      { id: 1, title: "Official Bonafide Certificate (AY 2026-27)", doc_type: "Bonafide", uploaded_at: "10 Aug 2026", seal: "EDU360 Official Seal - Reg #9923", sha256: "c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a089f86d081884c7d659a2feaa0", download_url: "/documents/bonafide_rohan.pdf" },
      { id: 2, title: "Consolidated Term 1 CBSE Marks Memo", doc_type: "Marks Card", uploaded_at: "02 Oct 2026", seal: "EDU360 Examination Controller Seal", sha256: "ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934", download_url: "/documents/term1_marks_rohan.pdf" }
    ]
  }
};

function getStudentData(idNum: number): StudentDossier {
  if (studentDirectory[idNum]) {
    return studentDirectory[idNum];
  }
  // Universal fallback for any other student ID
  const defaultNames = ["Meera Nambiar", "Kabir Mehta", "Tanvi Sen", "Siddharth Rao", "Ananya Reddy"];
  const name = defaultNames[(idNum - 1) % defaultNames.length] || `Student #${idNum}`;
  return {
    id: idNum,
    name,
    roll_no: String(idNum).padStart(2, '0'),
    class_name: "Class 8-B",
    adm_no: `EDU-2024-${String(idNum).padStart(3, '0')}`,
    cbse_reg_no: `CBSE/2026/8B/${String(idNum).padStart(2, '0')}`,
    pen_number: `PEN-994821${String(100 + idNum)}`,
    dob: "15 Jun 2012",
    gender: idNum % 2 === 0 ? "Female" : "Male",
    house: "Phoenix House (Gold)",
    house_color: "from-amber-500 to-yellow-600",
    attendance_pct: 92.5,
    academic_average_pct: 82.0,
    class_rank: `#${idNum + 3} in Class 8-B`,
    board_eligible: true,
    father: {
      name: `Mr. Guardian of ${name.split(' ')[0]}`,
      phone: `+91 98450 ${String(idNum * 11111).slice(0, 5)}`,
      email: `guardian.${name.toLowerCase().split(' ')[0]}@gmail.com`,
      occupation: "Corporate Executive",
      is_primary: true
    },
    mother: {
      name: `Mrs. Parent of ${name.split(' ')[0]}`,
      phone: `+91 98450 ${String((idNum + 1) * 11111).slice(0, 5)}`,
      email: `mother.${name.toLowerCase().split(' ')[0]}@gmail.com`,
      occupation: "Healthcare Professional",
      authorized_pickup: true
    },
    residential_address: {
      street: `#${idNum * 101}, Prestige Lakeside Habitat`,
      area: "Varthur Road",
      city: "Bengaluru, Karnataka",
      pin: "560087",
      commute_distance: "5.1 km to campus"
    },
    medical: {
      blood_group: "B+ (Positive)",
      allergies: "None reported",
      dietary: "Vegetarian",
      emergency_physician: "Dr. M. Gupta (Apollo Clinic)",
      physician_phone: "+91 80 2345 6709",
      asthma_clearance: "Clear"
    },
    bus_fleet: {
      route_name: "Route B-12 (Whitefield Express)",
      bus_number: "KA-01-ED-3601",
      driver_name: "Mr. Ramesh Kumar",
      driver_phone: "+91 98450 77112",
      designated_stop: "Lakeside Gate 1",
      pickup_time: "07:38 AM",
      drop_time: "03:48 PM",
      live_speed: "35 km/h",
      current_gps_status: "Active Tracking"
    },
    academic_subjects: [
      { subject: "Mathematics", term1_marks: 41, term2_marks: 43, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Good conceptual clarity." },
      { subject: "Science (Physics/Chem/Bio)", term1_marks: 44, term2_marks: 45, max_marks: 50, grade: "A2", status: "Consistent", remarks: "Active laboratory participation." },
      { subject: "English Language & Literature", term1_marks: 45, term2_marks: 46, max_marks: 50, grade: "A1", status: "Exemplary", remarks: "Great communication and vocabulary." },
      { subject: "Social Science", term1_marks: 40, term2_marks: 42, max_marks: 50, grade: "B1", status: "Consistent", remarks: "Regular assignment completion." },
      { subject: "Computer Applications / AI", term1_marks: 47, term2_marks: 48, max_marks: 50, grade: "A1", status: "Exemplary", remarks: "High aptitude in digital projects." }
    ],
    biometric_swipes: [
      { date: "Today (18 Oct 2026)", in_time: "08:11 AM", out_time: "In Session", terminal: "RFID Gate 1", status: "On-Time" }
    ],
    documents: [
      { id: 1, title: "Official Bonafide Certificate (AY 2026-27)", doc_type: "Bonafide", uploaded_at: "10 Aug 2026", seal: "EDU360 Official Seal - Reg #9921", sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", download_url: "#" },
      { id: 2, title: "Consolidated Term 1 CBSE Marks Memo", doc_type: "Marks Card", uploaded_at: "02 Oct 2026", seal: "EDU360 Examination Controller Seal", sha256: "7d793037a0760186574b0282f2f435e70d63877d7f6899e72c0385419addfc26", download_url: "#" }
    ]
  };
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();

  const idNum = Number(params?.id) || 1;
  const [student, setStudent] = useState<StudentDossier>(() => getStudentData(idNum));
  const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'remarks' | 'attendance' | 'transport' | 'vault'>('profile');
  const [remarks, setRemarks] = useState<StudentRemark[]>(() => getRemarksForStudent(idNum));
  const [remarkCategoryFilter, setRemarkCategoryFilter] = useState<string>('ALL');
  const [showAddRemarkModal, setShowAddRemarkModal] = useState<boolean>(false);
  const [newRemarkCategory, setNewRemarkCategory] = useState<any>('Academic Excellence');
  const [newRemarkPriority, setNewRemarkPriority] = useState<any>('Routine');
  const [newRemarkText, setNewRemarkText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setStudent(getStudentData(idNum));
    setRemarks(getRemarksForStudent(idNum));
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'remarks') {
        setActiveTab('remarks');
      }
    }
  }, [idNum]);

  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim()) return;
    const newEntry: StudentRemark = {
      id: Date.now(),
      student_id: student.id,
      student_name: student.name,
      author_name: "Mrs. Ananya Verma",
      author_role: "Class Teacher",
      category: newRemarkCategory,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      remark_text: newRemarkText.trim(),
      priority: newRemarkPriority,
      acknowledged_by_parent: false
    };
    setRemarks(prev => [newEntry, ...prev]);
    setNewRemarkText('');
    setShowAddRemarkModal(false);
    triggerToast("Official faculty observation recorded and dispatched to parent & administration.");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDossier = () => {
    triggerToast(`Generating certified PDF dossier for ${student.name} with cryptographic seal...`);
    setTimeout(() => {
      triggerToast(`Downloaded: ${student.name.replace(' ', '_')}_Official_SIS_Dossier_2026-27.pdf`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 shadow-2xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Universal Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
        
        {/* Left: Back button & Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/teacher?tab=roster"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
            title="Return to Student Roster"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to My Students</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/teacher" className="hover:text-blue-600 transition-colors">Teacher Portal</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/teacher?tab=roster" className="hover:text-blue-600 transition-colors">My Students</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">
              {student.name} (Roll #{student.roll_no})
            </span>
          </nav>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={handleDownloadDossier}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
            title="Download Official Certified PDF"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Download Certified PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
            title="Print Official Record"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          <Link
            href={`/teacher?tab=parent_chat&studentId=${student.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat with Parent</span>
          </Link>
        </div>
      </header>

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top Hero Banner: Student Identity Dossier */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left: Avatar & Identity Details */}
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shrink-0">
                {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 px-3 py-0.5 text-xs font-bold border border-teal-200 dark:border-teal-800">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    Student Information System (SIS) Official Record
                  </span>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold border border-amber-200 dark:border-amber-800">
                    {student.house}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {student.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Class {student.class_name} &bull; Roll #{student.roll_no} &bull; Adm #{student.adm_no} &bull; CBSE Affiliation #103049 &bull; Academic Session 2026-27
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <span>DOB: <strong>{student.dob}</strong></span>
                  <span>&bull;</span>
                  <span>Gender: <strong>{student.gender}</strong></span>
                  <span>&bull;</span>
                  <span>PEN: <strong className="font-mono">{student.pen_number}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Academic Status Badges & Quick KPIs */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>CBSE Board Exam Eligible ({student.attendance_pct}%)</span>
              </span>

              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{student.attendance_pct}%</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic Avg</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{student.academic_average_pct}%</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Class Standing</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{student.class_rank}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Faculty Remarks</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{remarks.length} Official Notes</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-thin">
          {[
            { id: 'profile', label: 'Identity & Demographics', icon: Users },
            { id: 'academics', label: 'Academic Standing & Grades', icon: BookOpen },
            { id: 'remarks', label: `Faculty Remarks & Conduct (${remarks.length})`, icon: MessageSquareQuote },
            { id: 'attendance', label: 'Attendance & Biometrics', icon: CalendarCheck },
            { id: 'transport', label: 'Bus Fleet & Transport', icon: Bus },
            { id: 'vault', label: 'Official Documents Vault', icon: FileText }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: IDENTITY & DEMOGRAPHICS */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Father & Primary Guardian */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-[11px] uppercase font-bold text-teal-700 dark:text-teal-400 tracking-wider">
                    Father &amp; Primary Guardian
                  </span>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                    Verified Primary Contact
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {student.father.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Occupation: {student.father.occupation}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Mobile Phone</span>
                        <span className="font-bold">{student.father.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Email Address</span>
                        <span className="font-bold">{student.father.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Link
                      href={`/teacher?tab=parent_chat&studentId=${student.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2 text-xs font-bold transition-all text-center shadow-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Direct Chat with Guardian</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mother & Secondary Guardian */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-[11px] uppercase font-bold text-purple-700 dark:text-purple-400 tracking-wider">
                    Mother &amp; Secondary Guardian
                  </span>
                  <span className="rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-[10px] font-bold">
                    Authorized Emergency Pickup
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {student.mother.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Occupation: {student.mother.occupation}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Mobile Phone</span>
                        <span className="font-bold">{student.mother.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Email Address</span>
                        <span className="font-bold">{student.mother.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 italic">
                    Registered for emergency student release with verified biometric signature.
                  </div>
                </div>
              </div>

              {/* Medical Profile & Health Room Clearance */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <HeartPulse className="h-4 w-4 text-rose-500" />
                  <span className="text-[11px] uppercase font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                    Medical Profile &amp; Emergency Clearance
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group</span>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5 block">{student.medical.blood_group}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recorded Allergies</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student.medical.allergies}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Dietary Restrictions</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student.medical.dietary}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Respiratory Status</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student.medical.asthma_clearance}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200">
                  <span className="font-bold block">Designated Family Physician:</span>
                  <span>{student.medical.emergency_physician} • {student.medical.physician_phone}</span>
                </div>
              </div>

              {/* Residential Address & Commute Zone */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-[11px] uppercase font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                    Residential Address &amp; Commute Zone
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {student.residential_address.street}
                  </p>
                  <p>{student.residential_address.area}</p>
                  <p>{student.residential_address.city} &bull; PIN: {student.residential_address.pin}</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">School Commute Radius:</span>
                    <span>{student.residential_address.commute_distance}</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
                    Zone B-12
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIC STANDING & GRADES */}
        {activeTab === 'academics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    CBSE Formative &amp; Summative Performance Matrix (AY 2026-27)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Official assessment records verified by Academic Controller. Scaled out of 50 marks per term.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-xl">
                    Overall CGPA: {(student.academic_average_pct / 9.5).toFixed(1)} / 10.0
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                    <tr>
                      <th className="p-4">Subject</th>
                      <th className="p-4 text-center">Term 1 (50)</th>
                      <th className="p-4 text-center">Term 2 (50)</th>
                      <th className="p-4 text-center">Aggregate</th>
                      <th className="p-4 text-center">Grade</th>
                      <th className="p-4">Standing</th>
                      <th className="p-4">Faculty Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {student.academic_subjects.map((sub, idx) => {
                      const total = sub.term1_marks + sub.term2_marks;
                      const pct = Math.round((total / (sub.max_marks * 2)) * 100);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            {sub.subject}
                          </td>
                          <td className="p-4 text-center font-mono font-bold">{sub.term1_marks}</td>
                          <td className="p-4 text-center font-mono font-bold">{sub.term2_marks}</td>
                          <td className="p-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                            {total}/100 ({pct}%)
                          </td>
                          <td className="p-4 text-center">
                            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-bold font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              {sub.grade}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              sub.status === 'Exemplary'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : sub.status === 'Focus Area'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 italic">
                            {sub.remarks}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FACULTY REMARKS & BEHAVIORAL CONDUCT */}
        {activeTab === 'remarks' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header with KPI & Action */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-0.5 text-xs font-bold border border-amber-200 dark:border-amber-800">
                      🔒 Official Institutional Dossier
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Strict Role Visibility: Faculty • Parents • Administration (Student Excluded)
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                    Pedagogical Observations, Behavioral Notes &amp; Conduct Ledger
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Continuous assessment remarks logged by Class Teachers, Subject Mentors, School Counselors, and Principal.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddRemarkModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Record New Faculty Remark</span>
                </button>
              </div>

              {/* Remarks Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Recorded</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">{remarks.length} Remarks</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Official session entries</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase font-bold block">Parent Acknowledged</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                    {remarks.filter(r => r.acknowledged_by_parent).length} / {remarks.length}
                  </span>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-0.5 block">Signed off digitally</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                  <span className="text-[10px] text-blue-800 dark:text-blue-400 uppercase font-bold block">Latest Observation</span>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300 mt-1 block">
                    {remarks[0]?.date || 'None'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">By {remarks[0]?.author_name || 'Faculty'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60">
                  <span className="text-[10px] text-purple-800 dark:text-purple-400 uppercase font-bold block">Disciplinary Index</span>
                  <span className="text-sm font-bold text-purple-700 dark:text-purple-300 mt-1 block">
                    100% Exemplary
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Zero infractions recorded</span>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Category:
                </span>
                {['ALL', 'Academic Excellence', 'Behavioral & Conduct', 'Special Commendation', 'Remedial / Focus Area', 'Sports & Leadership'].map((cat) => {
                  const count = cat === 'ALL' ? remarks.length : remarks.filter(r => r.category === cat).length;
                  const isSelected = remarkCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setRemarkCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remarks Stream / Cards */}
            <div className="space-y-4">
              {remarks
                .filter(r => remarkCategoryFilter === 'ALL' || r.category === remarkCategoryFilter)
                .map((remark) => (
                  <div
                    key={remark.id}
                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 hover:border-amber-300 dark:hover:border-amber-800 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                          {remark.author_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {remark.author_name}
                            </h4>
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                              {remark.author_role}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Logged on {remark.date} &bull; {remark.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          remark.priority === 'High Attention'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                            : remark.priority === 'Commendation'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {remark.priority}
                        </span>

                        <span className="rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3 py-0.5 text-[11px] font-bold">
                          {remark.category}
                        </span>
                      </div>
                    </div>

                    {/* Remark Text Content */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
                      &ldquo;{remark.remark_text}&rdquo;
                    </div>

                    {/* Acknowledgment & Audit Trail Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs">
                      <div className="flex items-center gap-2">
                        {remark.acknowledged_by_parent ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-xl text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Digitally Acknowledged by {remark.parent_ack_by} ({remark.parent_ack_date})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-xl text-[11px]">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Pending Guardian Acknowledgment</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        Audited by Academic Bureau &bull; SHA-256 Sealed
                      </span>
                    </div>

                  </div>
                ))}
            </div>

          </div>
        )}

        {/* TAB 3: ATTENDANCE & BIOMETRICS */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  CBSE Statutory Threshold
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {student.attendance_pct}%
                  </span>
                  <span className="text-xs text-slate-400">/ 75% Required</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, student.attendance_pct)}%` }} 
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Student maintains safe margin (+{Math.round(student.attendance_pct - 75)}%) above the CBSE mandatory examination attendance cut-off.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Working Days &amp; Absences
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    184
                  </span>
                  <span className="text-xs text-slate-400">/ 192 Session Days</span>
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Approved Medical Leaves:</span>
                    <strong className="font-mono">4 days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Authorized Casual Leaves:</span>
                    <strong className="font-mono">4 days</strong>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Unexplained Absences:</span>
                    <strong className="font-mono">0 days</strong>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Punctuality &amp; Gate Turnstile
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                    98.4%
                  </span>
                  <span className="text-xs text-slate-400">On-Time Swipes</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Monitored via optical biometrics &amp; RFID cards at Campus Gate 1 &amp; Turnstile 2.
                </p>
              </div>

            </div>

            {/* Biometric logs table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Recent Biometric Turnstile Swipe Records
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Arrival In-Time</th>
                      <th className="p-3.5">Departure Out-Time</th>
                      <th className="p-3.5">Turnstile Terminal</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {student.biometric_swipes.map((swipe, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{swipe.date}</td>
                        <td className="p-3.5 font-mono text-emerald-600 font-bold">{swipe.in_time}</td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{swipe.out_time}</td>
                        <td className="p-3.5 text-slate-500">{swipe.terminal}</td>
                        <td className="p-3.5">
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                            {swipe.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BUS FLEET & TRANSPORT */}
        {activeTab === 'transport' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Designated Bus Fleet Assignment
                    </span>
                  </div>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                    Live Telemetry Active
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Route Information</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {student.bus_fleet.route_name}
                    </h4>
                    <span className="font-mono text-slate-500">Vehicle Plate: {student.bus_fleet.bus_number}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assigned Campus Driver:</span>
                      <strong className="text-slate-900 dark:text-white">{student.bus_fleet.driver_name}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Driver Contact:</span>
                      <a href={`tel:${student.bus_fleet.driver_phone}`} className="font-mono font-bold text-blue-600 hover:underline">
                        {student.bus_fleet.driver_phone}
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Morning Pickup</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">{student.bus_fleet.pickup_time}</span>
                      <span className="text-[10px] text-slate-500">{student.bus_fleet.designated_stop}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Evening Drop</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">{student.bus_fleet.drop_time}</span>
                      <span className="text-[10px] text-slate-500">{student.bus_fleet.designated_stop}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live GPS Radar Simulation */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      YellowBus Live Radar &amp; Geo-Fence
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    Speed: {student.bus_fleet.live_speed}
                  </span>
                </div>

                <div className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
                  <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                    <Bus className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Bus Approaching Varthur Radial
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      GPS Signal 100% Locked &bull; {student.bus_fleet.current_gps_status}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Telemetry synced with Parent Companion App in real-time
                  </span>
                </div>

                <div className="text-xs text-slate-500 italic">
                  Automated parent push notification dispatched 5 minutes prior to bus arrival at {student.bus_fleet.designated_stop}.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: OFFICIAL DOCUMENTS VAULT */}
        {activeTab === 'vault' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Security note */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Official CBSE &amp; Institutional Document Vault
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    All legal certificates are cryptographically verified with official SHA-256 digital seals. Faculty access is certified for academic verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Document list */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {student.documents.map((doc) => (
                  <div key={doc.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                          <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 text-[9px] font-bold">
                            {doc.doc_type}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                          Seal: <strong>{doc.seal}</strong> &bull; Uploaded {doc.uploaded_at}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate max-w-md">
                          SHA-256: {doc.sha256}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          triggerToast(`Downloading certified copy of ${doc.title}...`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Certified Copy</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ADD FACULTY REMARK MODAL */}
      {showAddRemarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <MessageSquareQuote className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Record Official Pedagogical Observation
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Candidate: {student.name} (Roll #{student.roll_no})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowAddRemarkModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRemark} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Remark Category
                </label>
                <select
                  value={newRemarkCategory}
                  onChange={(e) => setNewRemarkCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Academic Excellence">Academic Excellence</option>
                  <option value="Behavioral & Conduct">Behavioral &amp; Conduct</option>
                  <option value="Special Commendation">Special Commendation</option>
                  <option value="Remedial / Focus Area">Remedial / Focus Area</option>
                  <option value="Sports & Leadership">Sports &amp; Leadership</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Observation Priority
                </label>
                <select
                  value={newRemarkPriority}
                  onChange={(e) => setNewRemarkPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Routine">Routine Faculty Observation</option>
                  <option value="Commendation">Commendation &amp; Praise</option>
                  <option value="High Attention">High Attention / Needs Parent Follow-up</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Faculty Observation Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  placeholder="Provide precise academic feedback, behavioral observations, or commendable achievements..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-[11px] text-teal-900 dark:text-teal-200">
                🔒 Note: This remark will be synchronized with the Parent Companion App and Administration Dossier. The student will not have access.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRemarkModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
                >
                  Save &amp; Dispatch Remark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Footer */}
      <Footer />
    </div>
  );
}
