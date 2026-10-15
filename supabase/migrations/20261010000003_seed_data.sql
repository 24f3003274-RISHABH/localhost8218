-- PrimePrep Migration 003: Seed Data
-- Seeds foundational exam categories, CUET PG subjects, test series, tests, and sample questions.

-- 1. SEED EXAM CATEGORIES
INSERT INTO public.exam_categories (id, slug, name, description, display_order)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'computer-science-tech', 'Computer Science & Tech', 'MCA and MSc Computer Science streams', 1),
  ('c1000000-0000-0000-0000-000000000002', 'science', 'Science', 'Life Sciences, Mathematics, Physics, Chemistry', 2),
  ('c1000000-0000-0000-0000-000000000003', 'commerce-management', 'Commerce & Management', 'General MBA, LLB, Economics, and Mass Comm papers', 3),
  ('c1000000-0000-0000-0000-000000000004', 'humanities', 'Humanities & Social Sciences', 'Political Science, Psychology, History, and English', 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED SUBJECTS
INSERT INTO public.subjects (id, category_id, code, name, description, total_domain_questions, duration_minutes, marking_correct, marking_incorrect)
VALUES
  ('s1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'SCQP09', 'Computer Science & Information Technology', 'MCA and MSc CS paper code covering data structures, OS, DBMS, discrete math', 75, 105, 4, -1),
  ('s1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'COQP11', 'General Paper (Management, MBA, LLB, Mass Comm)', 'Aptitude, logical reasoning, data interpretation, verbal ability', 75, 105, 4, -1),
  ('s1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'COQP12', 'Economics & Applied Economics', 'Microeconomics, macroeconomics, econometrics, Indian economy', 75, 105, 4, -1),
  ('s1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'SCQP08', 'Life Sciences / Botany / Zoology / Bio-Tech', 'Molecular biology, genetics, biochemistry, cell biology', 75, 105, 4, -1),
  ('s1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'SCQP17', 'Mathematics & Applied Mathematics', 'Real analysis, modern algebra, linear algebra, differential equations', 75, 105, 4, -1),
  ('s1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'SCQP24', 'Physics', 'Classical mechanics, quantum mechanics, electromagnetism', 75, 105, 4, -1),
  ('s1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004', 'HUQP18', 'Political Science & International Relations', 'Political theory, comparative politics, Indian politics, IR', 75, 105, 4, -1),
  ('s1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 'HUQP20', 'Psychology & Applied Psychology', 'Cognitive psychology, clinical psychology, psychometrics', 75, 105, 4, -1)
ON CONFLICT (code) DO NOTHING;

-- 3. SEED TEST SERIES
-- Prices in integer paise (e.g. 799 INR = 79900 paise)
INSERT INTO public.test_series (id, subject_id, slug, title, description, price_paise, original_price_paise, is_free, is_published, validity_days, language, difficulty_level, featured)
VALUES
  (
    't1000000-0000-0000-0000-000000000001',
    's1000000-0000-0000-0000-000000000001',
    'cuet-pg-free-diagnostic',
    'CUET PG All-Stream Diagnostic Mock',
    'Open diagnostic mock assessing baseline readiness under official 75-question CBT guidelines.',
    0,
    NULL,
    true,
    true,
    365,
    'English',
    'Foundational',
    true
  ),
  (
    't1000000-0000-0000-0000-000000000002',
    's1000000-0000-0000-0000-000000000001',
    'cuet-pg-mca-scqp09',
    'CUET PG MCA & Computer Science Test Series',
    'Comprehensive test series for MCA and MSc CS aspirants targeting DU, JNU, BHU, and Central Universities.',
    79900,
    129900,
    false,
    true,
    180,
    'English',
    'Comprehensive',
    true
  ),
  (
    't1000000-0000-0000-0000-000000000003',
    's1000000-0000-0000-0000-000000000002',
    'cuet-pg-general-coqp11',
    'CUET PG General Paper Test Series',
    'Mock test series for COQP11 covering numerical ability, logical reasoning, and verbal comprehension.',
    69900,
    109900,
    false,
    true,
    180,
    'English',
    'Moderate',
    true
  ),
  (
    't1000000-0000-0000-0000-000000000004',
    's1000000-0000-0000-0000-000000000003',
    'cuet-pg-economics-coqp12',
    'CUET PG Economics Comprehensive Series',
    'Rigorous domain test series for MA/MSc Economics at DSE, JNU, BHU, and Hyderabad Central University.',
    79900,
    119900,
    false,
    true,
    180,
    'English',
    'Advanced',
    false
  ),
  (
    't1000000-0000-0000-0000-000000000005',
    's1000000-0000-0000-0000-000000000004',
    'cuet-pg-life-sciences-scqp08',
    'CUET PG Life Sciences & Biotechnology Series',
    'Extensive question bank and timed mock series covering molecular biology, genetics, and physiology.',
    79900,
    129900,
    false,
    true,
    180,
    'English',
    'Comprehensive',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- 4. SEED TESTS
INSERT INTO public.tests (id, subject_id, title, slug, type, total_questions, duration_minutes, total_marks, is_free_preview, is_published, instructions)
VALUES
  (
    'm1000000-0000-0000-0000-000000000001',
    's1000000-0000-0000-0000-000000000001',
    'CUET PG CS Diagnostic Test 01',
    'cuet-pg-cs-diag-01',
    'diagnostic',
    75,
    105,
    300,
    true,
    true,
    'Each correct response is awarded +4 marks. An incorrect response incurs -1 mark penalty. Total duration is 105 minutes.'
  ),
  (
    'm1000000-0000-0000-0000-000000000002',
    's1000000-0000-0000-0000-000000000001',
    'SCQP09 Full Length Mock 01',
    'scqp09-full-mock-01',
    'full_length',
    75,
    105,
    300,
    false,
    true,
    'Full syllabus NTA CBT test covering Data Structures, OS, DBMS, Networks, and Discrete Mathematics.'
  )
ON CONFLICT (slug) DO NOTHING;

-- 5. LINK TESTS TO TEST SERIES
INSERT INTO public.test_series_items (test_series_id, test_id, sort_order)
VALUES
  ('t1000000-0000-0000-0000-000000000001', 'm1000000-0000-0000-0000-000000000001', 1),
  ('t1000000-0000-0000-0000-000000000002', 'm1000000-0000-0000-0000-000000000002', 1)
ON CONFLICT (test_series_id, test_id) DO NOTHING;

-- 6. SEED SAMPLE QUESTIONS & OPTIONS
INSERT INTO public.questions (id, subject_id, question_text, topic, difficulty, explanation)
VALUES
  (
    'q1000000-0000-0000-0000-000000000001',
    's1000000-0000-0000-0000-000000000001',
    'Which data structure is primarily utilized by the Operating System to maintain the process scheduling queue with dynamic priority levels?',
    'Operating Systems',
    'Moderate',
    'A Multilevel Feedback Queue (MLFQ) is designed to allow processes to move between queues based on their CPU burst characteristics and dynamic priority.'
  ),
  (
    'q1000000-0000-0000-0000-000000000002',
    's1000000-0000-0000-0000-000000000001',
    'What is the worst-case time complexity of searching for an element in an AVL tree containing n nodes?',
    'Data Structures',
    'Easy',
    'An AVL tree maintains height balance where height h is bounded by O(log n). Therefore, searching requires at most O(log n) time in all cases including worst case.'
  )
ON CONFLICT (id) DO NOTHING;

-- Options for Question 1
INSERT INTO public.question_options (question_id, option_label, option_text, is_correct, explanation)
VALUES
  ('q1000000-0000-0000-0000-000000000001', 'A', 'Single-ended Linear Stack', false, 'A stack enforces LIFO and cannot dynamically reorder processes by priority.'),
  ('q1000000-0000-0000-0000-000000000001', 'B', 'Multilevel Feedback Priority Queue', true, 'Correct. MLFQ dynamically adjusts priorities based on process burst behavior.'),
  ('q1000000-0000-0000-0000-000000000001', 'C', 'Static Array Buffer', false, 'Static arrays have fixed sizing and poor insertion efficiency for dynamic queues.'),
  ('q1000000-0000-0000-0000-000000000001', 'D', 'Simple Circular FIFO Queue', false, 'Simple FIFO queues do not support differential process priority adjustments.')
ON CONFLICT (question_id, option_label) DO NOTHING;

-- Options for Question 2
INSERT INTO public.question_options (question_id, option_label, option_text, is_correct, explanation)
VALUES
  ('q1000000-0000-0000-0000-000000000002', 'A', 'O(n)', false, 'O(n) occurs in degenerate un-balanced BSTs, but AVL trees strictly rebalance to prevent skew.'),
  ('q1000000-0000-0000-0000-000000000002', 'B', 'O(log n)', true, 'Correct. The strict height-balancing invariant ensures height is O(log n).'),
  ('q1000000-0000-0000-0000-000000000002', 'C', 'O(n log n)', false, 'O(n log n) is sorting complexity, not single-element lookup.'),
  ('q1000000-0000-0000-0000-000000000002', 'D', 'O(1)', false, 'O(1) average lookup applies to hash tables, not tree traversal.')
ON CONFLICT (question_id, option_label) DO NOTHING;

-- Link questions to test
INSERT INTO public.test_questions (test_id, question_id, question_order, section_name)
VALUES
  ('m1000000-0000-0000-0000-000000000001', 'q1000000-0000-0000-0000-000000000001', 1, 'Domain Specific - Operating Systems'),
  ('m1000000-0000-0000-0000-000000000001', 'q1000000-0000-0000-0000-000000000002', 2, 'Domain Specific - Data Structures')
ON CONFLICT (test_id, question_id) DO NOTHING;
