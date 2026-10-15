import { TestSeries } from '../types';

/**
 * PrimePrep Seed Data
 * Centralized repository of CUET PG test series and mock examination packages.
 * Strictly adheres to NTA CUET PG specifications:
 * - 75 domain-specific multiple choice questions per full mock
 * - 105 minutes duration
 * - Marking scheme: +4 for correct response, -1 for incorrect response
 */
export const TEST_SERIES_CATALOGUE: TestSeries[] = [
  {
    id: 'cuet-pg-free-starter',
    title: 'CUET PG All-Stream Diagnostic Mock',
    exam: 'CUET PG 2026',
    subject: 'General & Domain Diagnostic Assessment',
    subjectCode: 'FREE-DIAG-01',
    category: 'Computer Science & Tech',
    testsCount: 2,
    questionsCount: 150,
    duration: '105 Mins per test',
    accessDuration: 'Lifetime Free Access',
    price: 0,
    isFree: true,
    featured: true,
    description: 'An open full-length diagnostic mock designed to benchmark your conceptual readiness against official NTA CBT examination standards.',
    features: [
      'Authentic NTA computer-based testing interface',
      'Instant question-by-question explanatory solutions',
      'Sectional time-spent and accuracy breakdown',
      'Negative marking penalty impact audit'
    ],
    syllabusTopics: [
      'Domain Foundational Principles',
      'Analytical Problem Solving',
      'High-Yield Pattern Questions',
      'Previous Year Paper Benchmarks'
    ],
    difficultyLevel: 'Foundational',
    language: 'English'
  },
  {
    id: 'cuet-pg-mca-scqp09',
    title: 'CUET PG MCA & Computer Science Test Series',
    exam: 'CUET PG 2026',
    subject: 'Computer Science & Information Technology',
    subjectCode: 'SCQP09',
    category: 'Computer Science & Tech',
    testsCount: 15,
    questionsCount: 1125,
    duration: '105 Mins per test',
    accessDuration: '6 Months (Until Exam Date)',
    price: 799,
    originalPrice: 1299,
    isFree: false,
    featured: true,
    description: 'Comprehensive test series for MCA and MSc Computer Science aspirants targeting DU, JNU, BHU, and Central Universities.',
    features: [
      '10 Full-length mocks strictly on 75-question NTA format',
      '5 Topic-focused sectional drills (Data Structures, OS, DBMS, Discrete Math)',
      'Detailed step-by-step code logic and mathematical derivations',
      'Sectional percentile distribution and speed analytics'
    ],
    syllabusTopics: [
      'Data Structures & Algorithms',
      'Discrete Mathematics & Linear Algebra',
      'Operating Systems & Memory Management',
      'Database Management Systems & SQL',
      'Computer Networks & Architecture'
    ],
    difficultyLevel: 'Comprehensive',
    language: 'English'
  },
  {
    id: 'cuet-pg-general-coqp11',
    title: 'CUET PG General Paper Test Series',
    exam: 'CUET PG 2026',
    subject: 'General Paper (Management, MBA, LLB, Mass Comm)',
    subjectCode: 'COQP11',
    category: 'Commerce & Management',
    testsCount: 12,
    questionsCount: 900,
    duration: '105 Mins per test',
    accessDuration: '6 Months (Until Exam Date)',
    price: 699,
    originalPrice: 1099,
    isFree: false,
    featured: true,
    description: 'Targeted mock test series for COQP11 paper covering quantitative ability, logical reasoning, data interpretation, and verbal comprehension.',
    features: [
      '8 Full-length timed CBT simulation mocks',
      '4 High-yield sectional mocks for Data Interpretation and Quants',
      'Detailed analytical solutions with alternative short-cut methods',
      'Speed-versus-accuracy calibration feedback'
    ],
    syllabusTopics: [
      'Quantitative Aptitude & Numerical Ability',
      'Logical & Analytical Reasoning',
      'Data Interpretation & Graphical Analysis',
      'English Verbal Ability & Reading Comprehension',
      'General Knowledge & Current Perspectives'
    ],
    difficultyLevel: 'Moderate',
    language: 'English'
  },
  {
    id: 'cuet-pg-economics-coqp12',
    title: 'CUET PG Economics Comprehensive Series',
    exam: 'CUET PG 2026',
    subject: 'Economics & Applied Economics',
    subjectCode: 'COQP12',
    category: 'Commerce & Management',
    testsCount: 14,
    questionsCount: 1050,
    duration: '105 Mins per test',
    accessDuration: '6 Months (Until Exam Date)',
    price: 799,
    originalPrice: 1199,
    isFree: false,
    featured: false,
    description: 'Rigorous domain test series for MA/MSc Economics at DSE, JNU (CESP & SIS), BHU, and Hyderabad Central University.',
    features: [
      '10 Full-length mocks aligned with latest micro & macro trends',
      '4 Specialized mathematical economics & econometrics drills',
      'In-depth mathematical proofs and graphical justifications',
      'Categorized difficulty tagging per question'
    ],
    syllabusTopics: [
      'Microeconomics: Consumer Theory, Production & Market Forms',
      'Macroeconomics: IS-LM, Open Economy, Growth Models',
      'Mathematical Methods in Economics & Linear Programming',
      'Statistical Methods & Elementary Econometrics',
      'Indian Economy & Development Policy'
    ],
    difficultyLevel: 'Advanced',
    language: 'English'
  },
  {
    id: 'cuet-pg-life-sciences-scqp08',
    title: 'CUET PG Life Sciences & Biotechnology Series',
    exam: 'CUET PG 2026',
    subject: 'Life Sciences / Botany / Zoology / Bio-Tech',
    subjectCode: 'SCQP08',
    category: 'Science',
    testsCount: 15,
    questionsCount: 1125,
    duration: '105 Mins per test',
    accessDuration: '6 Months (Until Exam Date)',
    price: 799,
    originalPrice: 1299,
    isFree: false,
    featured: true,
    description: 'Extensive question bank and timed mock series covering molecular biology, genetics, ecology, physiology, and modern bio-techniques.',
    features: [
      '10 Full-length domain mocks with high-resolution biological diagrams',
      '5 Sub-discipline tests across Biochemistry, Cell Biology & Genetics',
      'Precise factual & conceptual justifications referenced to standard texts',
      'Topic-level strength and weakness diagnostic radar'
    ],
    syllabusTopics: [
      'Molecular & Cellular Biology',
      'Genetics, Genomics & Evolution',
      'Plant & Animal Physiology',
      'Biochemistry & Enzymology',
      'Ecology, Biodiversity & Bio-techniques'
    ],
    difficultyLevel: 'Comprehensive',
    language: 'English'
  },
  {
    id: 'cuet-pg-mathematics-scqp17',
    title: 'CUET PG Mathematics Test Series',
    exam: 'CUET PG 2026',
    subject: 'Mathematics & Applied Mathematics',
    subjectCode: 'SCQP17',
    category: 'Science',
    testsCount: 12,
    questionsCount: 900,
    duration: '105 Mins per test',
    accessDuration: '6 Months (Until Exam Date)',
    price: 749,
    originalPrice: 1199,
    isFree: false,
    featured: false,
    description: 'Precision test series with rigorous problem sets across Real Analysis, Abstract Algebra, Linear Algebra, and Differential Equations.',
    features: [
      '8 Full-length timed mock tests with NTA marking rules',
      '4 Sectional drills dedicated to proofs and matrix computations',
      'Complete typed step-by-step mathematical solutions',
      'Time-efficiency analysis per problem category'
    ],
    syllabusTopics: [
      'Real Analysis & Metric Spaces',
      'Group Theory & Modern Algebra',
      'Linear Algebra & Vector Spaces',
      'Ordinary & Partial Differential Equations',
      'Complex Analysis & Numerical Methods'
    ],
    difficultyLevel: 'Advanced',
    language: 'English'
  },
  {
    id: 'cuet-pg-physics-scqp24',
    title: 'CUET PG Physics Master Test Series',
    exam: 'CUET PG 2026',
    subject: 'Physics',
    subjectCode: 'SCQP24',
    category: 'Science',
    testsCount: 12,
    questionsCount: 900,
    duration: '105 Mins per test',
    accessDuration: '6 Months (Until Exam Date)',
    price: 749,
    originalPrice: 1199,
    isFree: false,
    featured: false,
    description: 'Structured mock exams for MSc Physics admissions at top central universities, covering classical, quantum, and electromagnetic theory.',
    features: [
      '8 Comprehensive CBT mock exams',
      '4 Sectional problem sets for Quantum and Thermodynamics',
      'Rigorous physical formula derivations and step-by-step explanations',
      'Sectional timing management coaching feedback'
    ],
    syllabusTopics: [
      'Classical Mechanics & Special Relativity',
      'Electromagnetic Theory & Electrodynamics',
      'Quantum Mechanics & Atomic Structure',
      'Thermodynamics & Statistical Physics',
      'Solid State Physics & Electronics'
    ],
    difficultyLevel: 'Advanced',
    language: 'English'
  },
  {
    id: 'cuet-pg-pol-science-huqp18',
    title: 'CUET PG Political Science Series',
    exam: 'CUET PG 2026',
    subject: 'Political Science & International Relations',
    subjectCode: 'HUQP18',
    category: 'Humanities & Social Sciences',
    testsCount: 12,
    questionsCount: 900,
    duration: '105 Mins per test',
    accessDuration: '6 Months (Until Exam Date)',
    price: 699,
    originalPrice: 1099,
    isFree: false,
    featured: false,
    description: 'In-depth domain tests for MA Political Science and IR programs across JNU (CPS), DU, Hyderabad University, and BHU.',
    features: [
      '8 Full-length domain mocks adhering to NTA structure',
      '4 Specialized thematic tests on Indian Politics & Global Affairs',
      'Exhaustive scholarly context notes for each MCQ',
      'Chronology and constitutional article reference guides'
    ],
    syllabusTopics: [
      'Western & Indian Political Thought',
      'Political Theory & Core Concepts',
      'Comparative Politics & Political Analysis',
      'Indian Government, Politics & Public Policy',
      'International Relations & Global Geopolitics'
    ],
    difficultyLevel: 'Moderate',
    language: 'Bilingual (Hindi / English)'
  },
  {
    id: 'cuet-pg-psychology-huqp20',
    title: 'CUET PG Psychology Master Series',
    exam: 'CUET PG 2026',
    subject: 'Psychology & Applied Psychology',
    subjectCode: 'HUQP20',
    category: 'Humanities & Social Sciences',
    testsCount: 12,
    questionsCount: 900,
    duration: '105 Mins per test',
    accessDuration: '6 Months (Until Exam Date)',
    price: 699,
    originalPrice: 1099,
    isFree: false,
    featured: false,
    description: 'Targeted preparation for MA/MSc Psychology entrance covering cognitive psychology, biological bases, psychometrics, and research methods.',
    features: [
      '8 Full-length mocks reflecting current empirical research questions',
      '4 Focused tests on Statistics, Research Methodology, and Testing',
      'Concept definitions, experimental studies, and cited justifications',
      'Detailed answer key with common distractor analysis'
    ],
    syllabusTopics: [
      'Foundations of Psychology & Cognitive Processes',
      'Biological Bases of Behavior & Neuropsychology',
      'Developmental & Social Psychology',
      'Psychopathology & Clinical Interventions',
      'Research Methods, Statistics & Psychological Measurement'
    ],
    difficultyLevel: 'Moderate',
    language: 'English'
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    stepNumber: '01',
    title: 'Select Your Domain Paper',
    description: 'Choose your specific CUET PG paper code (e.g. SCQP09 for MCA, COQP11 for General, SCQP08 for Life Sciences) with verified syllabus alignment.'
  },
  {
    stepNumber: '02',
    title: 'Take Timed CBT Simulations',
    description: 'Practice under authentic computer-based testing conditions: 75 questions in 105 minutes with official question palette navigation and NTA marking rules.'
  },
  {
    stepNumber: '03',
    title: 'Review Step-by-Step Solutions',
    description: 'Inspect comprehensive theoretical explanations, mathematical derivations, and distractor analyses immediately upon test submission.'
  },
  {
    stepNumber: '04',
    title: 'Calibrate Time & Sectional Strategy',
    description: 'Evaluate sectional pacing, unforced error rates, and negative marking penalty deductions to systematically improve your net score.'
  }
];

export const BENEFITS_LIST = [
  {
    title: 'Exact NTA CBT Exam Interface',
    description: 'Practice on a replica of the real test portal. Master question status indicators (Answered, Marked for Review, Unvisited) and avoid exam-day disorientation.'
  },
  {
    title: 'Exhaustive Conceptual Explanations',
    description: 'Every single question includes clear pedagogical explanations. Understand not just why the right option is correct, but why alternate choices are invalid.'
  },
  {
    title: 'Granular Time-Per-Question Metrics',
    description: 'Identify time-sink questions where you spend disproportionate effort. Train to allocate your 105 minutes strategically across all 75 questions.'
  },
  {
    title: 'Negative Marking Penalty Auditing',
    description: 'Understand the statistical impact of blind guessing versus calculated elimination under the +4 / -1 scoring model before taking the actual exam.'
  },
  {
    title: 'Domain-Focused Syllabus Coverage',
    description: 'Tests are crafted by postgraduate educators aligned directly to the official National Testing Agency syllabus document for each paper code.'
  },
  {
    title: 'Full Flexibility & Re-Attempt Support',
    description: 'Re-test on completed sets or review solved papers on desktop, tablet, or mobile browser with zero installation barriers.'
  }
];

export const CUET_PG_EXAM_OVERVIEW = {
  conductingBody: 'National Testing Agency (NTA)',
  modeOfExam: 'Computer Based Test (CBT)',
  examDuration: '105 Minutes (1 Hour 45 Minutes)',
  totalQuestions: '75 Domain-Specific MCQs',
  totalMarks: '300 Marks',
  markingScheme: '+4 for each correct answer; -1 for each incorrect answer; 0 for unattempted',
  languages: 'English & Hindi (Bilingual), except for language papers',
  targetAdmissions: 'Postgraduate Programs (MA, MSc, MCom, MCA, MBA, LLB, MTech) in Central, State, and Participating Deemed Universities'
};
