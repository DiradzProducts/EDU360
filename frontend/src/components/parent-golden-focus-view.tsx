'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  Brain,
  Check,
  ChevronRight,
  Eye,
  FileCheck,
  UserCheck,
  ShieldCheck,
  Calendar,
  Download,
  AlertTriangle,
  Award
} from 'lucide-react';
import { downloadStudyNotesFile } from '@/lib/export-utils';

interface PlanDayItem {
  day_num: number;
  day_label: string;
  date_str: string;
  title: string;
  focus_task: string;
  syllabus_topic: string;
  resource: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  student_work: {
    file_name: string;
    file_size: string;
    submitted_at: string;
    student_notes: string;
    teacher_score?: string;
  } | null;
  parent_checklist: string;
  parent_approved: boolean;
}

interface SubjectFocusData {
  id: string;
  subject: string;
  score: number;
  target_score: number;
  status_type: 'critical' | 'inprogress' | 'ontrack';
  faculty: string;
  exam_name: string;
  weak_concept: string;
  diagnostic_summary: string;
  ai_observation: string;
  recommended_action: string;
  days: PlanDayItem[];
}

const JUNIOR_INITIAL_SUBJECT_DATA: Record<string, SubjectFocusData> = {
  reading: {
    id: 'reading',
    subject: 'Phonics & Story Magic',
    score: 68,
    target_score: 90,
    status_type: 'inprogress',
    faculty: 'Ms. Priya Nair',
    exam_name: 'Grade 3 Diagnostic Reading Sprint',
    weak_concept: 'Blended Consonants (str, spl) & Silent E Rules',
    diagnostic_summary: 'Ananya reads fluently but hesitates when encountering multi-syllable consonant blends.',
    ai_observation: 'Gemini AI Analysis: Phonemic mapping is 88% accurate. Sight word recognition is instantaneous. Daily sound blending flashcards recommended.',
    recommended_action: 'Daily 15-minute aloud phonics flashcard drills with guardian signature.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: 'Three-Letter Consonant Blends (str, spl)',
        focus_task: 'Read aloud the 15 vowel blend flashcards and color the matching word family pictures.',
        syllabus_topic: 'Primary Phonics Unit 3: Complex Blends',
        resource: 'Targeted Phonics Sheet #1: Blends Magic',
        status: 'Completed',
        student_work: {
          file_name: 'Ananya_Day1_Phonics_Practice.pdf',
          file_size: '950 KB',
          submitted_at: '14 Oct, 05:30 PM',
          student_notes: 'Practiced 15 word cards aloud with mother.',
          teacher_score: '5 / 5 Stars (Verified)'
        },
        parent_checklist: 'Listen to pronunciation of string, splash, and spring.',
        parent_approved: true
      },
      {
        day_num: 2,
        day_label: 'Day 2 (Tue)',
        date_str: '15 Oct 2026',
        title: 'Magic Silent E Transformations',
        focus_task: 'Transform short vowels into long vowels (cap -> cape, hop -> hope).',
        syllabus_topic: 'Silent E Rule & Vowel Lengthening',
        resource: 'Silent E Story Book Worksheet',
        status: 'Completed',
        student_work: {
          file_name: 'Ananya_Day2_SilentE_Stories.pdf',
          file_size: '1.1 MB',
          submitted_at: '15 Oct, 06:10 PM',
          student_notes: 'Colored all silent E magic hats in the worksheet.'
        },
        parent_checklist: 'Verify Ananya pronounces the long vowel sound correctly.',
        parent_approved: true
      },
      {
        day_num: 3,
        day_label: 'Day 3 (Wed)',
        date_str: '16 Oct 2026',
        title: 'Story Narration with Character Voices',
        focus_task: 'Read The Little Red Hen with expressive character intonation.',
        syllabus_topic: 'Early Fluency & Expression',
        resource: 'Primary Graded Reader #4',
        status: 'In Progress',
        student_work: {
          file_name: 'Ananya_Day3_Story_Narration.pdf',
          file_size: '1.2 MB',
          submitted_at: 'Today, 05:15 PM',
          student_notes: 'Read pages 1 to 8 aloud. Recorded 1 voice sample.'
        },
        parent_checklist: 'Listen to page 8 reading and co-sign.',
        parent_approved: false
      }
    ]
  },
  math: {
    id: 'math',
    subject: 'Junior Mathematics',
    score: 72,
    target_score: 90,
    status_type: 'inprogress',
    faculty: 'Mrs. Kavitha Reddy',
    exam_name: 'Primary Mental Math Sprint',
    weak_concept: '2-Digit Regrouping & Carrying into Tens Column',
    diagnostic_summary: 'Ananya adds single digits effortlessly; needs practice with caterpillar carry-over addition.',
    ai_observation: 'Gemini AI Analysis: Concept of base-10 blocks is understood visually. Number line hopping reinforces carrying.',
    recommended_action: '10-minute caterpillar regrouping worksheet with colored beads.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: 'Caterpillar Addition Hops',
        focus_task: 'Solve 8 regrouping problems carrying 1 into the tens circle.',
        syllabus_topic: 'Primary Grade 3 Math: Addition with Regrouping',
        resource: 'Caterpillar Number Line Worksheet',
        status: 'Completed',
        student_work: {
          file_name: 'Ananya_Day1_Caterpillar_Math.pdf',
          file_size: '820 KB',
          submitted_at: '14 Oct, 06:15 PM',
          student_notes: 'All 8 hops solved using colored pencils.'
        },
        parent_checklist: 'Check that carried 1 is clearly written inside the green circle.',
        parent_approved: true
      }
    ]
  },
  evs: {
    id: 'evs',
    subject: 'Environmental Studies',
    score: 88,
    target_score: 95,
    status_type: 'ontrack',
    faculty: 'Ms. Priya Nair',
    exam_name: 'Living Organisms Exploration',
    weak_concept: 'Plant Seed Germination Phases',
    diagnostic_summary: 'Excellent grasp of animal habitats; review the chronological order of seed embryo sprouting.',
    ai_observation: 'Gemini AI Analysis: Strong sensory understanding. Hands-on bean sprout activity provided.',
    recommended_action: 'Observe damp cotton bean seed sprout and sketch daily changes.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: 'Bean Seed Embryo Sprouting Journal',
        focus_task: 'Sketch the root (radicle) emerging from the soaked kidney bean.',
        syllabus_topic: 'Primary Science: How Plants Grow',
        resource: 'Nature Observation Journal Sheet',
        status: 'Completed',
        student_work: {
          file_name: 'Ananya_Day1_Seed_Journal.pdf',
          file_size: '1.3 MB',
          submitted_at: '14 Oct, 04:45 PM',
          student_notes: 'Drew the tiny green tail popping out of the bean!'
        },
        parent_checklist: 'Verify the drawing shows root facing downwards.',
        parent_approved: true
      }
    ]
  }
};

const INITIAL_SUBJECT_DATA: Record<string, SubjectFocusData> = {
  math: {
    id: 'math',
    subject: 'Mathematics',
    score: 42,
    target_score: 80,
    status_type: 'critical',
    faculty: 'Mrs. Sunitha Rao',
    exam_name: 'Term 1 CBSE Assessment',
    weak_concept: 'Algebraic Fractions & Negative Sign Distribution -(3x - 5)',
    diagnostic_summary: 'Aarav consistently drops negative signs when multiplying binomial numerators and confuses LCM denominators in rational expressions.',
    ai_observation: 'Gemini AI Analysis: Error cluster isolated to distributive property over subtraction. Foundational arithmetic is sound, but algebraic sign discipline falters under timed test conditions. Mandate bracket enclosures for all negative terms.',
    recommended_action: 'Daily 20-minute bracket expansion drills + parent co-signed rough notebook review before bed.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: 'Sign Inversion Rules in Fractions',
        focus_task: 'Enclosing -(a - b) into (-a + b) with strict bracket placement in 6 practice problems.',
        syllabus_topic: 'NCERT Ch 9: Algebraic Expressions & Identities (Section 9.4)',
        resource: 'Targeted Worksheet #1: Negative Distributive Drills',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day1_Math_SignRules.pdf',
          file_size: '1.2 MB',
          submitted_at: '14 Oct, 06:45 PM',
          student_notes: 'Solved all 6 problems. Kept brackets around negative terms as teacher advised.',
          teacher_score: '5.5 / 6.0 (Verified)'
        },
        parent_checklist: 'Check that every negative term has parentheses around it before expansion.',
        parent_approved: true
      },
      {
        day_num: 2,
        day_label: 'Day 2 (Tue)',
        date_str: '15 Oct 2026',
        title: 'Common Denominator LCM Calculations',
        focus_task: 'Finding the lowest common multiple of binomial denominators (x - 2) and (x + 3).',
        syllabus_topic: 'NCERT Ch 9: Rational Fractions & Multi-term Denominators',
        resource: 'Mrs. Sunitha Rao Step-by-Step LCM Formula Sheet',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day2_LCM_Fractions.pdf',
          file_size: '980 KB',
          submitted_at: '15 Oct, 07:15 PM',
          student_notes: 'Completed cross-multiplication with binomial factors. Showed full working.',
          teacher_score: '5.0 / 5.0 (Excellent)'
        },
        parent_checklist: 'Ensure Aarav writes the common denominator as a factored product first.',
        parent_approved: true
      },
      {
        day_num: 3,
        day_label: 'Day 3 (Today, Wed)',
        date_str: '16 Oct 2026',
        title: 'Simplifying Multi-term Algebraic Fractions',
        focus_task: 'Solve 5 complex simplification equations under 25 minutes without calculator.',
        syllabus_topic: 'NCERT Ch 9: Multi-step Fractional Equations',
        resource: 'Remedial Problem Set #3 (5 Board Exam Style Questions)',
        status: 'In Progress',
        student_work: {
          file_name: 'Aarav_Day3_MultiTerm_RoughWork.pdf',
          file_size: '1.4 MB',
          submitted_at: 'Today, 05:30 PM',
          student_notes: 'Completed 4 out of 5 problems. Working on Problem 5 fraction cancellation.'
        },
        parent_checklist: 'Inspect rough notebook to verify cancellation only occurs across common factors.',
        parent_approved: false
      },
      {
        day_num: 4,
        day_label: 'Day 4 (Thu)',
        date_str: '17 Oct 2026',
        title: '15-Minute Timed Remedial Exit Test',
        focus_task: 'Timed micro-assessment to verify mastery score > 75% and graduate from sprint.',
        syllabus_topic: 'Comprehensive Assessment: Algebraic Fractions Mastery',
        resource: 'Automated Diagnostic Exit Paper: Mrs. Sunitha Rao',
        status: 'Upcoming',
        student_work: null,
        parent_checklist: 'Time Aarav for exactly 15 minutes and sign the top right corner of the answer paper.',
        parent_approved: false
      }
    ]
  },
  physics: {
    id: 'physics',
    subject: 'Physics & Science',
    score: 58,
    target_score: 80,
    status_type: 'inprogress',
    faculty: 'Dr. K. Raman',
    exam_name: 'Term 1 Optics Assessment',
    weak_concept: 'Cartesian Sign Conventions in Spherical Mirrors (1/f = 1/v + 1/u)',
    diagnostic_summary: 'Student understands ray diagrams well but forgets that real images and focal lengths of concave mirrors carry negative signs in Cartesian coordinate systems.',
    ai_observation: 'Gemini AI Analysis: Conceptually strong in visual optics and ray tracing. Sign calculation mistakes stem from treating distances as scalar lengths rather than directed Cartesian vectors.',
    recommended_action: 'Always draw Cartesian axis at mirror pole with origin (0,0) before substituting numerical values.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: 'Cartesian Coordinate Origin Rule at Mirror Pole',
        focus_task: 'Draw 3 ray diagrams identifying pole P as (0,0). Object distance u is always negative.',
        syllabus_topic: 'CBSE Science Ch 10: Light - Reflection & Refraction (Sec 10.2.3)',
        resource: 'Optics Ray Diagram Cheat Sheet & Sign Grid',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day1_RayDiagram_Signs.pdf',
          file_size: '2.1 MB',
          submitted_at: '14 Oct, 08:00 PM',
          student_notes: 'Traced all 3 diagrams with arrows and labeled Cartesian quadrant signs.',
          teacher_score: 'Verified by Dr. Raman'
        },
        parent_checklist: 'Confirm that arrow marks show light traveling from left to right.',
        parent_approved: true
      },
      {
        day_num: 2,
        day_label: 'Day 2 (Tue)',
        date_str: '15 Oct 2026',
        title: 'Mirror Formula Numerical Substitutions',
        focus_task: 'Calculate image distance v using 1/f = 1/v + 1/u with concave mirror values.',
        syllabus_topic: 'CBSE Science Ch 10: Mirror Formula Calculations',
        resource: '5 Concave Mirror Numericals (Dr. Raman Lab Set)',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day2_MirrorNumericals.pdf',
          file_size: '1.5 MB',
          submitted_at: '15 Oct, 06:50 PM',
          student_notes: 'Solved all 5 numericals. Verified real image has negative v.',
          teacher_score: '18 / 20'
        },
        parent_checklist: 'Check that focal length f is written with a negative sign (e.g., f = -15 cm).',
        parent_approved: true
      },
      {
        day_num: 3,
        day_label: 'Day 3 (Today, Wed)',
        date_str: '16 Oct 2026',
        title: 'Magnification Formula m = -v/u & Virtual Images',
        focus_task: 'Distinguish magnification of real inverted images (m < 0) vs virtual erect images (m > 0).',
        syllabus_topic: 'CBSE Science Ch 10: Linear Magnification of Mirrors',
        resource: 'Worksheet: 4 Magnification Case Studies',
        status: 'In Progress',
        student_work: {
          file_name: 'Aarav_Day3_Magnification_Sheet.pdf',
          file_size: '1.1 MB',
          submitted_at: 'Today, 04:45 PM',
          student_notes: 'Completed case 1 to 3. Reviewing virtual image magnification.'
        },
        parent_checklist: 'Verify Aarav writes whether image is enlarged or diminished based on |m| value.',
        parent_approved: false
      },
      {
        day_num: 4,
        day_label: 'Day 4 (Thu)',
        date_str: '17 Oct 2026',
        title: 'Optics Remedial Exit Numerical Check',
        focus_task: 'Timed 4-problem test under Dr. Raman\'s guidance to exit the Optics remedial.',
        syllabus_topic: 'Comprehensive Optics Numerical Test',
        resource: 'Official Remedial Exit Paper',
        status: 'Upcoming',
        student_work: null,
        parent_checklist: 'Ensure child practices without looking up solutions in guide book.',
        parent_approved: false
      }
    ]
  },
  chemistry: {
    id: 'chemistry',
    subject: 'Chemistry',
    score: 62,
    target_score: 80,
    status_type: 'inprogress',
    faculty: 'Mrs. Rekha Sen',
    exam_name: 'Term 1 Chemical Equations Test',
    weak_concept: 'Balancing Redox Chemical Equations with Polyatomic Radicals',
    diagnostic_summary: 'Struggles with conserving oxygen and nitrate radical counts when balancing decomposition reactions of metal nitrates.',
    ai_observation: 'Gemini AI Analysis: Algebraic balancing method recommended over trial-and-error to avoid coefficient oscillations.',
    recommended_action: 'Treat nitrate (NO3) and sulfate (SO4) as single polyatomic units during balancing.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: 'Polyatomic Radical Tracking',
        focus_task: 'Balance 8 reactions treating NO3 and SO4 as intact structural radicals.',
        syllabus_topic: 'CBSE Class 8 Ch 4: Materials & Chemical Reactions',
        resource: 'Radical Conservation Worksheet',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day1_Chemistry_Radicals.pdf',
          file_size: '890 KB',
          submitted_at: '14 Oct, 07:10 PM',
          student_notes: 'Balanced all 8 equations using the bracket radical method.',
          teacher_score: '8 / 8 (Approved)'
        },
        parent_checklist: 'Ensure count of atoms on LHS strictly equals RHS.',
        parent_approved: true
      },
      {
        day_num: 2,
        day_label: 'Day 2 (Tue)',
        date_str: '15 Oct 2026',
        title: 'Thermal Decomposition of Lead Nitrate',
        focus_task: 'Master the 2Pb(NO3)2 -> 2PbO + 4NO2 + O2 balancing breakdown step-by-step.',
        syllabus_topic: 'Thermal Decomposition Reactions',
        resource: 'Reaction Mechanism Video & Practice Sheet',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day2_LeadNitrate_Decomp.pdf',
          file_size: '1.1 MB',
          submitted_at: '15 Oct, 05:40 PM',
          student_notes: 'Drew atom tally table before and after balancing.'
        },
        parent_checklist: 'Check the brown gas NO2 coefficient is written correctly as 4.',
        parent_approved: true
      },
      {
        day_num: 3,
        day_label: 'Day 3 (Today, Wed)',
        date_str: '16 Oct 2026',
        title: 'Multi-element Displacement Reactions',
        focus_task: 'Balance 6 reactivity series displacement reactions involving zinc and iron.',
        syllabus_topic: 'Metal Reactivity & Displacement',
        resource: 'Displacement Reaction Drill Set',
        status: 'In Progress',
        student_work: {
          file_name: 'Aarav_Day3_Displacement_Draft.pdf',
          file_size: '950 KB',
          submitted_at: 'Today, 06:15 PM',
          student_notes: 'Working on iron sulfate displacement reactions.'
        },
        parent_checklist: 'Confirm physical state symbols (s, aq, g) are included in final answers.',
        parent_approved: false
      },
      {
        day_num: 4,
        day_label: 'Day 4 (Thu)',
        date_str: '17 Oct 2026',
        title: 'Remedial Balancing Exit Speed Test',
        focus_task: 'Complete 10 balanced equations in 15 minutes to clear chemistry remedial.',
        syllabus_topic: 'Rapid Chemical Equation Balancing Test',
        resource: 'Timed Exit Sheet: Mrs. Rekha Sen',
        status: 'Upcoming',
        student_work: null,
        parent_checklist: 'Review child\'s rough sheets for neat atom tally tables.',
        parent_approved: false
      }
    ]
  },
  english: {
    id: 'english',
    subject: 'English Literature',
    score: 68,
    target_score: 85,
    status_type: 'inprogress',
    faculty: 'Ms. Deepa Menon',
    exam_name: 'Term 1 Descriptive Literature Paper',
    weak_concept: 'PEEL Essay Paragraph Architecture with Direct Textual Citations',
    diagnostic_summary: 'Aarav narrates plot summaries instead of building analytical arguments with embedded quotes from Shakespeare\'s Merchant of Venice.',
    ai_observation: 'Gemini AI Analysis: High vocabulary agility, but essay structure lacks argumentative rigor. Integrating direct citations will instantly lift marks from B1 to A1 distinction.',
    recommended_action: 'Use Point, Evidence (Quote), Explanation, Link (PEEL) structure for every body paragraph.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: 'PEEL Structure Framework',
        focus_task: 'Write 1 model analytical paragraph on Shylock\'s motivation using PEEL format.',
        syllabus_topic: 'CBSE Drama Analysis: Merchant of Venice (Act IV Scene 1)',
        resource: 'PEEL Writing Guide with Cambridge Rubric Examples',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day1_PEEL_Shylock.pdf',
          file_size: '780 KB',
          submitted_at: '14 Oct, 08:30 PM',
          student_notes: 'Used quote "I stand here for law" with 4-line analytical explanation.',
          teacher_score: '8.5 / 10 (Commended)'
        },
        parent_checklist: 'Ensure paragraph begins with a strong thesis point rather than story narration.',
        parent_approved: true
      },
      {
        day_num: 2,
        day_label: 'Day 2 (Tue)',
        date_str: '15 Oct 2026',
        title: 'Analyzing Portia\'s "Quality of Mercy" Speech',
        focus_task: 'Analyze the gentle rain metaphor and monarch\'s crown symbol in Portia\'s speech.',
        syllabus_topic: 'Literary Devices & Shakespearean Metaphors',
        resource: 'Annotated Text: Act IV Scene 1 Lines 180-205',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day2_Portia_Analysis.pdf',
          file_size: '920 KB',
          submitted_at: '15 Oct, 07:45 PM',
          student_notes: 'Deconstructed 2 metaphors with detailed PEEL explanations.'
        },
        parent_checklist: 'Verify Aarav explains why mercy is described as "twice blest".',
        parent_approved: true
      },
      {
        day_num: 3,
        day_label: 'Day 3 (Today, Wed)',
        date_str: '16 Oct 2026',
        title: 'Drafting Full 5-Paragraph Critical Essay',
        focus_task: 'Write 400-word essay comparing justice versus mercy with 3 direct quotes.',
        syllabus_topic: 'Thematic Comparative Essay Writing',
        resource: 'Model Essay Outline & Quote Memory Card',
        status: 'In Progress',
        student_work: {
          file_name: 'Aarav_Day3_JusticeVsMercy_Essay.pdf',
          file_size: '1.1 MB',
          submitted_at: 'Today, 05:10 PM',
          student_notes: 'Drafted introduction and two body paragraphs with citations.'
        },
        parent_checklist: 'Check that every quote is properly integrated into sentences with quotation marks.',
        parent_approved: false
      },
      {
        day_num: 4,
        day_label: 'Day 4 (Thu)',
        date_str: '17 Oct 2026',
        title: 'Final 40-Minute Timed Essay Assessment',
        focus_task: 'Timed essay write-up under exam conditions to graduate from English remedial.',
        syllabus_topic: 'Timed Board Exam Essay Practice',
        resource: 'Official Board Question Paper & Evaluation Matrix',
        status: 'Upcoming',
        student_work: null,
        parent_checklist: 'Time child for exactly 40 minutes without interruptions.',
        parent_approved: false
      }
    ]
  },
  biology: {
    id: 'biology',
    subject: 'Biology',
    score: 74,
    target_score: 85,
    status_type: 'inprogress',
    faculty: 'Mrs. Kavitha Reddy',
    exam_name: 'Term 1 Cell Biology Assessment',
    weak_concept: 'Plant vs Animal Cell Organelle Distinction & Diagram Labeling',
    diagnostic_summary: 'Occasionally confuses chloroplast thylakoid structure with mitochondria cristae during cross-section diagrams.',
    ai_observation: 'Gemini AI Analysis: High conceptual recall. Requires precise anatomical diagram labeling practice with ruler guidelines.',
    recommended_action: 'Practice 10-minute colored diagram sketch of plant cell with 8 labeled organelles.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: 'Plant Cell Wall vs Cell Membrane',
        focus_task: 'Draw cross-section highlighting cellulose cell wall and large central vacuole.',
        syllabus_topic: 'NCERT Ch 8: Cell Structure & Functions (Sec 8.5)',
        resource: 'High-Resolution Cell Micrograph Worksheet',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day1_PlantCell_Diagram.pdf',
          file_size: '2.4 MB',
          submitted_at: '14 Oct, 06:15 PM',
          student_notes: 'Labeled 8 organelles with sharp pencil guidelines as taught.',
          teacher_score: '9.0 / 10'
        },
        parent_checklist: 'Ensure all labels are horizontally aligned with a straight edge.',
        parent_approved: true
      },
      {
        day_num: 2,
        day_label: 'Day 2 (Tue)',
        date_str: '15 Oct 2026',
        title: 'Mitochondria vs Chloroplast Energy Converters',
        focus_task: 'Compare ATP generation in cristae vs photosynthesis in thylakoid grana.',
        syllabus_topic: 'Organelle Energy Mechanisms',
        resource: 'Comparative Organelle Function Chart',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day2_Organelle_Comparison.pdf',
          file_size: '1.2 MB',
          submitted_at: '15 Oct, 07:05 PM',
          student_notes: 'Completed comparative table with functional differences.'
        },
        parent_checklist: 'Review differences in double membrane structures.',
        parent_approved: true
      },
      {
        day_num: 3,
        day_label: 'Day 3 (Today, Wed)',
        date_str: '16 Oct 2026',
        title: 'Nucleus & Chromatin Structure Identification',
        focus_task: 'Illustrate nuclear pores, nucleolus, and chromatin thread organization.',
        syllabus_topic: 'Nuclear Membrane & Genetic Material',
        resource: 'Nucleus Anatomy Diagram Drill',
        status: 'In Progress',
        student_work: {
          file_name: 'Aarav_Day3_Nucleus_Sketch.pdf',
          file_size: '1.6 MB',
          submitted_at: 'Today, 04:20 PM',
          student_notes: 'Sketched nuclear envelope with pores and nucleoplasm.'
        },
        parent_checklist: 'Verify nuclear double membrane is clearly depicted.',
        parent_approved: false
      },
      {
        day_num: 4,
        day_label: 'Day 4 (Thu)',
        date_str: '17 Oct 2026',
        title: 'Cell Organelle Identification Exit Viva',
        focus_task: 'Identify 10 unlabelled organelle micrographs in 10 minutes.',
        syllabus_topic: 'Comprehensive Cell Structure Exit Test',
        resource: 'Microscopic Slide Identification Test',
        status: 'Upcoming',
        student_work: null,
        parent_checklist: 'Review child on key organelle definitions prior to test.',
        parent_approved: false
      }
    ]
  },
  cs: {
    id: 'cs',
    subject: 'Computer Science',
    score: 82,
    target_score: 90,
    status_type: 'ontrack',
    faculty: 'Mr. Arvind Swamy',
    exam_name: 'Term 1 Python Programming Assessment',
    weak_concept: 'Nested Loop Iteration & 2D List Matrix Traversal in Python',
    diagnostic_summary: 'Strong algorithmic intuition; minor off-by-one index mistakes when iterating across rows and columns in 2D grids.',
    ai_observation: 'Gemini AI Analysis: Exceptional syntax confidence. Recommend using range(len(matrix)) pattern with explicit row and col variables.',
    recommended_action: 'Practice 2D grid pathfinding and matrix transposition algorithms.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: '2D Matrix Row & Column Indexing',
        focus_task: 'Write Python script to print a 3x3 matrix with nested for loops.',
        syllabus_topic: 'CBSE Computer Science Ch 6: Python Lists & 2D Arrays',
        resource: 'Python Matrix Traversal Code Lab',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day1_Matrix_Traversal.py',
          file_size: '4 KB',
          submitted_at: '14 Oct, 05:40 PM',
          student_notes: 'Ran code successfully in Python 3.11. All tests passed.',
          teacher_score: '10 / 10'
        },
        parent_checklist: 'Verify program executes with zero indentation errors.',
        parent_approved: true
      },
      {
        day_num: 2,
        day_label: 'Day 2 (Tue)',
        date_str: '15 Oct 2026',
        title: 'Matrix Transposition Algorithm',
        focus_task: 'Swap rows and columns of matrix[i][j] into matrix[j][i].',
        syllabus_topic: 'Algorithmic List Manipulation',
        resource: 'Step-by-Step Matrix Transpose Code Guide',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day2_Transpose_Matrix.py',
          file_size: '5 KB',
          submitted_at: '15 Oct, 06:10 PM',
          student_notes: 'Implemented in-place swap using temporary variable.'
        },
        parent_checklist: 'Check output shows flipped rows into columns.',
        parent_approved: true
      },
      {
        day_num: 3,
        day_label: 'Day 3 (Today, Wed)',
        date_str: '16 Oct 2026',
        title: 'Sum of Diagonal Elements in 3x3 Matrix',
        focus_task: 'Calculate primary and secondary diagonal sum in a single loop.',
        syllabus_topic: 'Optimized Matrix Summation',
        resource: 'Diagonal Sum Coding Challenge',
        status: 'In Progress',
        student_work: {
          file_name: 'Aarav_Day3_DiagonalSum.py',
          file_size: '6 KB',
          submitted_at: 'Today, 03:50 PM',
          student_notes: 'Working on O(n) single loop optimization for secondary diagonal.'
        },
        parent_checklist: 'Verify program works on both even and odd dimension matrices.',
        parent_approved: false
      },
      {
        day_num: 4,
        day_label: 'Day 4 (Thu)',
        date_str: '17 Oct 2026',
        title: 'Timed Coding Assessment (20 Mins)',
        focus_task: 'Solve 2 matrix challenges in 20 minutes to earn Python Distinction badge.',
        syllabus_topic: 'Timed Practical Lab Test',
        resource: 'Automated Python Judge Test',
        status: 'Upcoming',
        student_work: null,
        parent_checklist: 'Supervise 20-minute timed coding session.',
        parent_approved: false
      }
    ]
  },
  social: {
    id: 'social',
    subject: 'Social Science',
    score: 76,
    target_score: 85,
    status_type: 'ontrack',
    faculty: 'Mr. Rajesh Nair',
    exam_name: 'Term 1 History & Civics Paper',
    weak_concept: 'Chronological Sequencing of Freedom Struggle & Constitutional Amendments',
    diagnostic_summary: 'Knows individual historical events well but occasionally inverts chronology between Non-Cooperation (1920) and Civil Disobedience (1930).',
    ai_observation: 'Gemini AI Analysis: Strong conceptual recall. Build an interactive horizontal timeline anchor to fix historical event sequencing permanently.',
    recommended_action: 'Construct a visual timeline sheet covering 1919 Jallianwala Bagh to 1947 Independence.',
    days: [
      {
        day_num: 1,
        day_label: 'Day 1 (Mon)',
        date_str: '14 Oct 2026',
        title: 'Nationalist Movement Timeline (1919 - 1930)',
        focus_task: 'Draw timeline mapping Rowlatt Act, Khilafat, Non-Cooperation, and Dandi March.',
        syllabus_topic: 'NCERT Ch 7: When People Rebel & Making of National Movement',
        resource: 'Freedom Movement Chronology Anchor Sheet',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day1_History_Timeline.pdf',
          file_size: '1.8 MB',
          submitted_at: '14 Oct, 07:30 PM',
          student_notes: 'Created colored timeline with key dates and leaders.',
          teacher_score: '9 / 10'
        },
        parent_checklist: 'Confirm Dandi March is marked precisely in 1930.',
        parent_approved: true
      },
      {
        day_num: 2,
        day_label: 'Day 2 (Tue)',
        date_str: '15 Oct 2026',
        title: 'Constitutional Preamble & Fundamental Rights',
        focus_task: 'Deconstruct Articles 14 to 32 and write 3 examples of Right to Equality in daily life.',
        syllabus_topic: 'NCERT Civics Ch 1: The Indian Constitution & Secularism',
        resource: 'Fundamental Rights Case Analysis Chart',
        status: 'Completed',
        student_work: {
          file_name: 'Aarav_Day2_Fundamental_Rights.pdf',
          file_size: '1.3 MB',
          submitted_at: '15 Oct, 06:30 PM',
          student_notes: 'Wrote analysis of Article 21 Right to Life and Article 14 Equality.'
        },
        parent_checklist: 'Verify Aarav can name all 6 Fundamental Rights from memory.',
        parent_approved: true
      },
      {
        day_num: 3,
        day_label: 'Day 3 (Today, Wed)',
        date_str: '16 Oct 2026',
        title: 'Directive Principles vs Fundamental Rights',
        focus_task: 'Compare Part III (Justiciable Rights) against Part IV (Welfare State Directives).',
        syllabus_topic: 'Directive Principles of State Policy',
        resource: 'Comparative Governance Matrix',
        status: 'In Progress',
        student_work: {
          file_name: 'Aarav_Day3_DPSP_Analysis.pdf',
          file_size: '980 KB',
          submitted_at: 'Today, 05:00 PM',
          student_notes: 'Completed difference table between legal enforceability and moral guidelines.'
        },
        parent_checklist: 'Check distinction between justiciable and non-justiciable principles.',
        parent_approved: false
      },
      {
        day_num: 4,
        day_label: 'Day 4 (Thu)',
        date_str: '17 Oct 2026',
        title: 'Chronology & Civics Exit Quiz',
        focus_task: 'Score > 80% on 15-question rapid quiz to complete social studies focus.',
        syllabus_topic: 'National Movement & Civics Mastery Test',
        resource: 'Automated History & Civics Quiz Paper',
        status: 'Upcoming',
        student_work: null,
        parent_checklist: 'Review child\'s timeline sheet prior to quiz.',
        parent_approved: false
      }
    ]
  }
};

interface ParentGoldenFocusViewProps {
  studentId?: number;
  studentName?: string;
}

export function ParentGoldenFocusView({
  studentId = 1,
  studentName = 'Aarav Sharma'
}: ParentGoldenFocusViewProps = {}) {
  const isJunior = studentId === 7;
  const initialData = isJunior ? JUNIOR_INITIAL_SUBJECT_DATA : INITIAL_SUBJECT_DATA;
  const [activeSubjectKey, setActiveSubjectKey] = useState<string>(isJunior ? 'reading' : 'math');
  const [subjectData, setSubjectData] = useState<Record<string, SubjectFocusData>>(initialData);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'inprogress' | 'ontrack'>('all');
  const [masterGuardianCoSigned, setMasterGuardianCoSigned] = useState<Record<string, boolean>>({
    math: true,
    physics: false,
    chemistry: false,
    english: false,
    biology: false,
    cs: false,
    social: false
  });

  const currentSubject = subjectData[activeSubjectKey] || subjectData.math;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Day Approval Checkbox
  const handleToggleDayApproval = (dayNum: number) => {
    setSubjectData(prev => {
      const current = prev[activeSubjectKey];
      const updatedDays = current.days.map(d => {
        if (d.day_num === dayNum) {
          const newState = !d.parent_approved;
          return { ...d, parent_approved: newState };
        }
        return d;
      });

      const toggledDay = updatedDays.find(d => d.day_num === dayNum);
      if (toggledDay?.parent_approved) {
        triggerToast(`Day ${dayNum} student work verified & co-signed by Guardian! ✓`);
      } else {
        triggerToast(`Day ${dayNum} verification signature cleared.`);
      }

      return {
        ...prev,
        [activeSubjectKey]: {
          ...current,
          days: updatedDays
        }
      };
    });
  };

  // Master Guardian Approval for entire Subject Plan
  const handleMasterGuardianApprove = () => {
    setMasterGuardianCoSigned(prev => ({
      ...prev,
      [activeSubjectKey]: true
    }));
    // Also approve all completed days
    setSubjectData(prev => {
      const current = prev[activeSubjectKey];
      const updatedDays = current.days.map(d => ({
        ...d,
        parent_approved: true
      }));
      return {
        ...prev,
        [activeSubjectKey]: {
          ...current,
          days: updatedDays
        }
      };
    });
    triggerToast(`Guardian has formally approved & co-signed the 4-Day ${currentSubject.subject} Focus Plan!`);
  };

  const subjectList = Object.values(subjectData).filter(s => {
    if (filterType === 'all') return true;
    return s.status_type === filterType;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-amber-500/40 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. GOLDEN AMBER WARM HERO HEADER: FOCUS TABLE SPRINT     */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-100/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-amber-950/30 p-6 shadow-sm space-y-5">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400/40 px-3 py-0.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Targeted Remedial Sprint &amp; Parental Verification Hub
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {studentName} &bull; {studentId === 7 ? 'Class 3-A' : 'Class 8-B'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
              {studentName}&apos;s Curriculum Focus Table &amp; Daily Practice Oversight
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              When assessment marks dip below target, EDU360 generates a 4-day revision timetable co-tracked by the teacher and parent. Inspect Aarav&apos;s submitted rough work, review syllabus concepts, and co-sign each day&apos;s practice in 1 click.
            </p>
          </div>

          {/* Master Approval Status Pill */}
          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-white/70 dark:bg-slate-800/80 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Guardian Sign-off Status
            </span>
            {masterGuardianCoSigned[activeSubjectKey] ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-xs font-black border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Guardian Co-Signed &amp; Approved &bull; Oct 2026</span>
              </span>
            ) : (
              <button
                onClick={handleMasterGuardianApprove}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Review &amp; Confirm Guardian Approval</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUBJECT FILTER PILLS BAR (7 SUBJECTS)                    */}
        {/* ========================================================= */}
        <div className="space-y-2.5 pt-2 border-t border-amber-200/70 dark:border-amber-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-200 tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-amber-600" />
              <span>Select Subject to Inspect Syllabus &amp; Student Work:</span>
            </span>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-amber-100/70 dark:bg-amber-950/60 p-1 rounded-xl text-[11px] font-bold border border-amber-300/60 dark:border-amber-800/60">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                All (7)
              </button>
              <button
                onClick={() => setFilterType('critical')}
                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'critical' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Critical (1)
              </button>
              <button
                onClick={() => setFilterType('inprogress')}
                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'inprogress' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                In Progress (4)
              </button>
              <button
                onClick={() => setFilterType('ontrack')}
                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'ontrack' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                On Track (2)
              </button>
            </div>
          </div>

          {/* 7 Subject Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {subjectList.map(subj => {
              const isSelected = subj.id === activeSubjectKey;
              return (
                <button
                  key={subj.id}
                  onClick={() => setActiveSubjectKey(subj.id)}
                  className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40'
                      : 'border-amber-200/90 dark:border-amber-800/60 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-amber-400'
                  }`}
                >
                  <span>{subj.subject}</span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-black ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : subj.status_type === 'critical'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : subj.status_type === 'inprogress'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {subj.score}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. ACTIVE SUBJECT DETAIL & DIAGNOSED MISCONCEPTION        */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
        
        {/* Subject Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold border border-amber-300 dark:border-amber-800">
                {currentSubject.subject} Focus
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Teacher In-Charge: <strong>{currentSubject.faculty}</strong> &bull; {currentSubject.exam_name}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Target Diagnosed Lag: {currentSubject.weak_concept}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {currentSubject.diagnostic_summary}
            </p>
          </div>

          {/* Current vs Target Score Card */}
          <div className="flex items-center gap-3 bg-amber-50/80 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 shrink-0">
            <div className="text-center px-3 border-r border-amber-200 dark:border-amber-800">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Exam Score</span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400 tabular-nums">
                {currentSubject.score}%
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Sprint Target</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {currentSubject.target_score}%
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUBJECT-WISE AI OBSERVATION & TEACHER ADVICE (INTERNAL)   */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-violet-200 dark:border-violet-800/60 bg-gradient-to-r from-violet-50/60 via-purple-50/30 to-amber-50/40 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-violet-950/30 p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-800 dark:text-violet-300 text-xs font-black">
              <Brain className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span>Subject-Wise AI Pedagogical Observation &amp; Synthesis ({currentSubject.subject})</span>
            </div>
            <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 px-2.5 py-0.5 rounded-full border border-violet-200">
              Gemini 1.5 Diagnostic Feed
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
            &ldquo;{currentSubject.ai_observation}&rdquo;
          </p>
          <div className="pt-2 border-t border-violet-100 dark:border-violet-900/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="font-semibold text-amber-900 dark:text-amber-200">
              Mandated Practice: <span className="font-normal">{currentSubject.recommended_action}</span>
            </span>
            <span className="text-slate-400">
              Verified by Faculty: {currentSubject.faculty}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4-DAY TARGETED REVISION TIMETABLE & STUDENT WORK REVIEW   */}
        {/* ========================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                4-Day Targeted Study Plan &bull; Student Work &amp; Parent Verification Checkbox
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {currentSubject.days.filter(d => d.parent_approved).length} of {currentSubject.days.length} Days Signed Off
            </span>
          </div>

          {/* Day Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSubject.days.map(day => {
              return (
                <div
                  key={day.day_num}
                  className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                    day.parent_approved
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/15'
                      : day.status === 'In Progress'
                      ? 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 ring-1 ring-amber-300 dark:ring-amber-800'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Day Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                          day.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : day.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {day.day_label}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {day.date_str}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <span className={`text-[11px] font-bold ${
                        day.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' :
                        day.status === 'In Progress' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                      }`}>
                        {day.status}
                      </span>
                    </div>

                    {/* Task Title & Syllabus */}
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {day.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {day.focus_task}
                      </p>
                      <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300 block mt-1">
                        Syllabus: {day.syllabus_topic}
                      </span>
                    </div>

                    {/* Student Submitted Work Card (What the student did) */}
                    {day.student_work ? (
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <FileCheck className="h-3 w-3 text-blue-500" />
                            {studentName}&apos;s Submitted Rough Work:
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {day.student_work.submitted_at}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => downloadStudyNotesFile(day.student_work?.file_name || 'RoughWork.pdf', currentSubject.subject)}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>{day.student_work.file_name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({day.student_work.file_size})</span>
                          </button>

                          {day.student_work.teacher_score && (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                              {day.student_work.teacher_score}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                          &ldquo;{day.student_work.student_notes}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-3 text-center text-xs text-slate-400">
                        Awaiting student submission of rough paper &amp; calculations
                      </div>
                    )}

                    {/* Parent Checklist Hint */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50/40 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
                      <strong className="text-amber-800 dark:text-amber-300">Guardian Inspection Note: </strong>
                      {day.parent_checklist}
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* PARENT APPROVAL CHECKBOX (WHAT THE USER ASKED FOR)       */}
                  {/* ========================================================= */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <label 
                      onClick={() => handleToggleDayApproval(day.day_num)}
                      className="flex items-center gap-2 cursor-pointer select-none group"
                    >
                      <div className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                        day.parent_approved 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-amber-500'
                      }`}>
                        {day.parent_approved && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${
                        day.parent_approved 
                          ? 'text-emerald-800 dark:text-emerald-300' 
                          : 'text-slate-700 dark:text-slate-300 group-hover:text-amber-600'
                      }`}>
                        {day.parent_approved ? 'Verified & Approved by Guardian ✓' : 'Click to Verify & Approve Done'}
                      </span>
                    </label>

                    {day.parent_approved && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Co-Signed
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
