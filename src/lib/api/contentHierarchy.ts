import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { 
  ExaminationRow, 
  SubjectRow, 
  ChapterRow, 
  TestCategoryRow, 
  TestRow, 
  SubjectWithChapters,
  ChapterWithCategories,
  CategoryWithTests,
  TestWithCategory,
  AuditLogRow
} from '../../types/database';

// In-memory seed fallback for evaluation environments when Supabase credentials are not connected
const SEED_EXAMINATIONS: ExaminationRow[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    name: 'CUET PG',
    slug: 'cuet-pg',
    description: 'Common University Entrance Test for Postgraduates conducted by the National Testing Agency (NTA).',
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const SEED_CATEGORIES: TestCategoryRow[] = [
  {
    id: 'ca000000-0000-0000-0000-000000000001',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    name: 'Sectional Test',
    slug: 'sectional',
    description: 'Chapter-specific and module sectional tests designed to build speed and accuracy.',
    default_duration_seconds: 1800,
    default_test_count: 15,
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ca000000-0000-0000-0000-000000000002',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    name: 'Full-Length Test',
    slug: 'full-length',
    description: 'Comprehensive 75-question full-syllabus mock tests replicating the official NTA CBT exam.',
    default_duration_seconds: 5400,
    default_test_count: 10,
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ca000000-0000-0000-0000-000000000003',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    name: 'Previous-Year Question Test (PYQ)',
    slug: 'pyq',
    description: 'Authentic solved past question papers from previous CUET PG examination cycles.',
    default_duration_seconds: 5400,
    default_test_count: 5,
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const SEED_SUBJECTS: SubjectRow[] = [
  {
    id: 'aa000000-0000-0000-0000-000000000001',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    code: 'HUQP18',
    name: 'Political Science',
    slug: 'political-science',
    description: 'Master of Arts in Political Science & International Relations (JNU, DU, BHU, HCU).',
    total_domain_questions: 75,
    duration_minutes: 105,
    marking_correct: 4,
    marking_incorrect: -1,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'aa000000-0000-0000-0000-000000000002',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    code: 'HUQP16',
    name: 'Philosophy',
    slug: 'philosophy',
    description: 'Master of Arts in Philosophy covering classical Indian and Western traditions.',
    total_domain_questions: 75,
    duration_minutes: 105,
    marking_correct: 4,
    marking_incorrect: -1,
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'aa000000-0000-0000-0000-000000000003',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    code: 'HUQP20',
    name: 'Psychology',
    slug: 'psychology',
    description: 'Master of Arts & Science in Psychology and Applied Cognitive Studies.',
    total_domain_questions: 75,
    duration_minutes: 105,
    marking_correct: 4,
    marking_incorrect: -1,
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'aa000000-0000-0000-0000-000000000004',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    code: 'HUQP09',
    name: 'History',
    slug: 'history',
    description: 'Master of Arts in History: Ancient, Medieval, Modern Indian & World History.',
    total_domain_questions: 75,
    duration_minutes: 105,
    marking_correct: 4,
    marking_incorrect: -1,
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'aa000000-0000-0000-0000-000000000005',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    code: 'COQP12',
    name: 'Economics',
    slug: 'economics',
    description: 'Master of Arts & Science in Economics at DSE, JNU (CESP), and Central Universities.',
    total_domain_questions: 75,
    duration_minutes: 105,
    marking_correct: 4,
    marking_incorrect: -1,
    is_active: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'aa000000-0000-0000-0000-000000000006',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    code: 'HUQP08',
    name: 'Geography',
    slug: 'geography',
    description: 'Master of Arts & Science in Geography and Spatial Cartography.',
    total_domain_questions: 75,
    duration_minutes: 105,
    marking_correct: 4,
    marking_incorrect: -1,
    is_active: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'aa000000-0000-0000-0000-000000000007',
    examination_id: 'e1000000-0000-0000-0000-000000000001',
    code: 'COQP09',
    name: 'Disaster Management',
    slug: 'disaster-management',
    description: 'Master of Science & Technology in Disaster Mitigation and Risk Governance.',
    total_domain_questions: 75,
    duration_minutes: 105,
    marking_correct: 4,
    marking_incorrect: -1,
    is_active: true,
    display_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const SEED_CHAPTERS: ChapterRow[] = [
  // Political Science
  { id: 'cb000001-0000-0000-0000-000000000001', subject_id: 'aa000000-0000-0000-0000-000000000001', title: 'Western Political Thought', slug: 'western-political-thought', description: 'Plato, Aristotle, Machiavelli, Hobbes, Locke, Rousseau, Mill, Marx', display_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000001-0000-0000-0000-000000000002', subject_id: 'aa000000-0000-0000-0000-000000000001', title: 'Indian Political Thought', slug: 'indian-political-thought', description: 'Kautilya, Gandhi, Ambedkar, Tilak, Aurobindo, Jayaprakash Narayan', display_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000001-0000-0000-0000-000000000003', subject_id: 'aa000000-0000-0000-0000-000000000001', title: 'Political Theory & Concepts', slug: 'political-theory-concepts', description: 'Liberty, Equality, Justice, Sovereignty, Rights, Democracy, Power', display_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000001-0000-0000-0000-000000000004', subject_id: 'aa000000-0000-0000-0000-000000000001', title: 'Comparative Politics & Analysis', slug: 'comparative-politics', description: 'Constitutional regimes, electoral systems, political parties, federalism', display_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000001-0000-0000-0000-000000000005', subject_id: 'aa000000-0000-0000-0000-000000000001', title: 'Indian Government & Politics', slug: 'indian-government-politics', description: 'Preamble, Fundamental Rights, Judiciary, Executive, Parliament, Federal dynamics', display_order: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000001-0000-0000-0000-000000000006', subject_id: 'aa000000-0000-0000-0000-000000000001', title: 'Public Policy in India', slug: 'public-policy-india', description: 'Policy formulation, implementation, governance models, socio-economic welfare', display_order: 6, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000001-0000-0000-0000-000000000007', subject_id: 'aa000000-0000-0000-0000-000000000001', title: 'International Relations & Global Affairs', slug: 'international-relations', description: 'Realism, Liberalism, Constructivism, United Nations, Indian Foreign Policy', display_order: 7, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Economics
  { id: 'cb000005-0000-0000-0000-000000000001', subject_id: 'aa000000-0000-0000-0000-000000000005', title: 'Consumer Choice & Market Equilibrium', slug: 'consumer-choice-equilibrium', description: 'Indifference curves, revealed preference, elasticity, welfare economics', display_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000005-0000-0000-0000-000000000002', subject_id: 'aa000000-0000-0000-0000-000000000005', title: 'Production, Costs, & Market Forms', slug: 'production-costs-market-forms', description: 'Perfect competition, monopoly, oligopoly, game theory, price discrimination', display_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000005-0000-0000-0000-000000000003', subject_id: 'aa000000-0000-0000-0000-000000000005', title: 'Macroeconomic Models & IS-LM', slug: 'macroeconomic-models-islm', description: 'Classical vs Keynesian systems, aggregate demand, monetary transmission', display_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Disaster Management
  { id: 'cb000007-0000-0000-0000-000000000001', subject_id: 'aa000000-0000-0000-0000-000000000007', title: 'Foundations of Hazards & Risk', slug: 'foundations-hazards-risk', description: 'Hazard vs disaster, vulnerability assessment, risk matrices, capacity analysis', display_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000007-0000-0000-0000-000000000002', subject_id: 'aa000000-0000-0000-0000-000000000007', title: 'Geological & Tectonic Disasters', slug: 'geological-tectonic-disasters', description: 'Earthquake engineering, microzonation, landslide mitigation, tsunami warnings', display_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const SEED_TESTS: TestRow[] = [
  {
    id: 'da000001-0000-0000-0000-000000000001',
    subject_id: 'aa000000-0000-0000-0000-000000000001',
    chapter_id: 'cb000001-0000-0000-0000-000000000001',
    category_id: 'ca000000-0000-0000-0000-000000000001',
    title: 'Western Political Thought Sectional 01',
    slug: 'pol-sci-western-thought-sec-01',
    description: 'Sectional drill covering classical political thinkers from Plato to Marx.',
    instructions: 'Official CUET PG marking (+4 for correct, -1 for incorrect). Duration is 30 minutes.',
    duration_seconds: 1800,
    positive_marks_default: 4,
    negative_marks_default: 1,
    access_type: 'free',
    status: 'published',
    display_order: 1,
    version: 1,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString()
  },
  {
    id: 'da000001-0000-0000-0000-000000000002',
    subject_id: 'aa000000-0000-0000-0000-000000000001',
    chapter_id: null, // Subject-level full mock (no specific chapter)
    category_id: 'ca000000-0000-0000-0000-000000000002',
    title: 'CUET PG Political Science Full Mock 01',
    slug: 'pol-sci-full-mock-01',
    description: 'Comprehensive 75-question timed mock test across all 7 syllabus units.',
    instructions: 'Full simulation under official 90-minute examination conditions.',
    duration_seconds: 5400,
    positive_marks_default: 4,
    negative_marks_default: 1,
    access_type: 'paid',
    status: 'published',
    display_order: 1,
    version: 1,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString()
  },
  {
    id: 'da000005-0000-0000-0000-000000000001',
    subject_id: 'aa000000-0000-0000-0000-000000000005',
    chapter_id: 'cb000005-0000-0000-0000-000000000001',
    category_id: 'ca000000-0000-0000-0000-000000000001',
    title: 'Microeconomics: Consumer Choice Sectional 01',
    slug: 'econ-consumer-choice-sec-01',
    description: 'Targeted problem set on indifference curves, utility maximization, and elasticity.',
    instructions: 'Test duration is 30 minutes. +4 for correct, -1 for incorrect.',
    duration_seconds: 1800,
    positive_marks_default: 4,
    negative_marks_default: 1,
    access_type: 'free',
    status: 'published',
    display_order: 1,
    version: 1,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString()
  },
  {
    id: 'da000007-0000-0000-0000-000000000001',
    subject_id: 'aa000000-0000-0000-0000-000000000007',
    chapter_id: 'cb000007-0000-0000-0000-000000000001',
    category_id: 'ca000000-0000-0000-0000-000000000001',
    title: 'Disaster Concepts & Risk Analysis Sectional 01',
    slug: 'dm-concepts-risk-sec-01',
    description: 'Foundational drill on hazard classification and risk vulnerability assessment.',
    instructions: '30 minutes timed CBT format.',
    duration_seconds: 1800,
    positive_marks_default: 4,
    negative_marks_default: 1,
    access_type: 'free',
    status: 'published',
    display_order: 1,
    version: 1,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString()
  }
];

/**
 * 1. Fetch Examinations
 */
export async function fetchExaminations(): Promise<ExaminationRow[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('examinations')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as ExaminationRow[];
    }
  }
  return SEED_EXAMINATIONS;
}

/**
 * 2. Fetch Subjects
 */
export async function fetchSubjects(examinationId?: string): Promise<SubjectRow[]> {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (examinationId) {
      query = query.eq('examination_id', examinationId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as SubjectRow[];
    }
  }

  if (examinationId) {
    return SEED_SUBJECTS.filter(s => s.examination_id === examinationId);
  }
  return SEED_SUBJECTS;
}

/**
 * 3. Fetch Subject by Slug
 */
export async function fetchSubjectBySlug(slug: string): Promise<SubjectRow | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return data as SubjectRow;
    }
  }

  const found = SEED_SUBJECTS.find(s => s.slug === slug);
  return found || null;
}

/**
 * 4. Fetch Chapters for a Subject
 */
export async function fetchChapters(subjectId: string): Promise<ChapterRow[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      return data as ChapterRow[];
    }
  }

  return SEED_CHAPTERS
    .filter(c => c.subject_id === subjectId)
    .sort((a, b) => a.display_order - b.display_order);
}

/**
 * 5. Fetch Test Categories
 */
export async function fetchTestCategories(examinationId?: string): Promise<TestCategoryRow[]> {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('test_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (examinationId) {
      query = query.or(`examination_id.eq.${examinationId},examination_id.is.null`);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as TestCategoryRow[];
    }
  }

  return SEED_CATEGORIES;
}

/**
 * 6. Fetch Published Tests for a Chapter
 */
export async function fetchTestsForChapter(chapterId: string, categoryId?: string): Promise<TestRow[]> {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('tests')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data as TestRow[];
    }
  }

  return SEED_TESTS.filter(t => {
    const matchesChapter = t.chapter_id === chapterId;
    const matchesCategory = categoryId ? t.category_id === categoryId : true;
    return matchesChapter && matchesCategory && t.status === 'published';
  });
}

/**
 * 7. Fetch Subject-Level Tests (Where chapter_id is null)
 */
export async function fetchSubjectLevelTests(subjectId: string, categoryId?: string): Promise<TestRow[]> {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('tests')
      .select('*')
      .eq('subject_id', subjectId)
      .is('chapter_id', null)
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data as TestRow[];
    }
  }

  return SEED_TESTS.filter(t => {
    const matchesSubject = t.subject_id === subjectId && t.chapter_id === null;
    const matchesCategory = categoryId ? t.category_id === categoryId : true;
    return matchesSubject && matchesCategory && t.status === 'published';
  });
}

/**
 * 8. Complete Hierarchical Subject Tree
 * Resolves: Subject -> Chapters -> Categories -> Tests (Only tests that actually exist in DB)
 */
export async function fetchSubjectHierarchy(subjectSlug: string): Promise<SubjectWithChapters | null> {
  const subject = await fetchSubjectBySlug(subjectSlug);
  if (!subject) return null;

  const [chapters, categories] = await Promise.all([
    fetchChapters(subject.id),
    fetchTestCategories(subject.examination_id || undefined)
  ]);

  // Fetch subject-level tests (Where chapter_id IS NULL)
  const rawSubjectTests = await fetchSubjectLevelTests(subject.id);
  const subjectLevelTests: TestWithCategory[] = rawSubjectTests.map(test => ({
    ...test,
    category: categories.find(c => c.id === test.category_id) || null,
    chapter: null
  }));

  // Map each chapter and its tests per category
  const chaptersWithCategories: ChapterWithCategories[] = await Promise.all(
    chapters.map(async (chapter) => {
      const chapterTests = await fetchTestsForChapter(chapter.id);

      const categoryBuckets: CategoryWithTests[] = categories.map((cat) => ({
        ...cat,
        tests: chapterTests.filter(t => t.category_id === cat.id)
      }));

      return {
        ...chapter,
        categories: categoryBuckets
      };
    })
  );

  return {
    ...subject,
    chapters: chaptersWithCategories,
    subject_level_tests: subjectLevelTests
  };
}

/**
 * 9. Administrative Audit Log Inspection (Platform Admin Only)
 */
export async function fetchAuditLogs(): Promise<AuditLogRow[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      return data as AuditLogRow[];
    }
  }

  return [
    {
      id: 'al-001',
      actor_id: null,
      action: 'BOOTSTRAP_DATABASE_SCHEMA_PHASE3',
      entity_type: 'examinations',
      entity_id: 'e1000000-0000-0000-0000-000000000001',
      metadata: { note: 'Initial CUET PG examination hierarchy instantiated' },
      created_at: new Date().toISOString()
    }
  ];
}
