-- PrimePrep Migration 005: Phase 3 Seed Data
-- Idempotent seed data for CUET PG Examination, 7 Core Subjects, 
-- Initial Chapters, and Configurable Test Categories.

-- 1. SEED EXAMINATION: CUET PG
INSERT INTO public.examinations (id, name, slug, description, is_active, display_order)
VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'CUET PG',
  'cuet-pg',
  'Common University Entrance Test for Postgraduates conducted by the National Testing Agency (NTA).',
  true,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. SEED CONFIGURED TEST CATEGORIES
-- Default durations stored in seconds. Default counts are configuration guidelines.
INSERT INTO public.test_categories (id, examination_id, name, slug, description, default_duration_seconds, default_test_count, display_order, is_active)
VALUES
  (
    'ca000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    'Sectional Test',
    'sectional',
    'Chapter-specific and domain module sectional tests designed to build speed and accuracy.',
    1800, -- 30 minutes
    15,   -- Configurable default target count
    1,
    true
  ),
  (
    'ca000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000001',
    'Full-Length Test',
    'full-length',
    'Comprehensive 75-question full-syllabus mock tests replicating the official NTA CBT exam.',
    5400, -- 90 minutes
    10,   -- Configurable default target count
    2,
    true
  ),
  (
    'ca000000-0000-0000-0000-000000000003',
    'e1000000-0000-0000-0000-000000000001',
    'Previous-Year Question Test (PYQ)',
    'pyq',
    'Authentic solved past question papers from previous CUET PG examination cycles.',
    5400, -- Configurable by administrator (default 90 mins)
    5,    -- Configurable default target count
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_duration_seconds = EXCLUDED.default_duration_seconds,
  default_test_count = EXCLUDED.default_test_count,
  display_order = EXCLUDED.display_order;

-- 3. SEED THE 7 INITIAL SUBJECTS
-- 1. Political Science
-- 2. Philosophy
-- 3. Psychology
-- 4. History
-- 5. Economics
-- 6. Geography
-- 7. Disaster Management
INSERT INTO public.subjects (id, examination_id, code, name, slug, description, total_domain_questions, duration_minutes, marking_correct, marking_incorrect, is_active, display_order)
VALUES
  (
    'aa000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP18',
    'Political Science',
    'political-science',
    'Master of Arts in Political Science & International Relations (JNU, DU, BHU, HCU).',
    75,
    105,
    4,
    -1,
    true,
    1
  ),
  (
    'aa000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP16',
    'Philosophy',
    'philosophy',
    'Master of Arts in Philosophy covering classical Indian and Western traditions.',
    75,
    105,
    4,
    -1,
    true,
    2
  ),
  (
    'aa000000-0000-0000-0000-000000000003',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP20',
    'Psychology',
    'psychology',
    'Master of Arts & Science in Psychology and Applied Cognitive Studies.',
    75,
    105,
    4,
    -1,
    true,
    3
  ),
  (
    'aa000000-0000-0000-0000-000000000004',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP09',
    'History',
    'history',
    'Master of Arts in History: Ancient, Medieval, Modern Indian & World History.',
    75,
    105,
    4,
    -1,
    true,
    4
  ),
  (
    'aa000000-0000-0000-0000-000000000005',
    'e1000000-0000-0000-0000-000000000001',
    'COQP12',
    'Economics',
    'economics',
    'Master of Arts & Science in Economics at DSE, JNU (CESP), and Central Universities.',
    75,
    105,
    4,
    -1,
    true,
    5
  ),
  (
    'aa000000-0000-0000-0000-000000000006',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP08',
    'Geography',
    'geography',
    'Master of Arts & Science in Geography and Spatial Cartography.',
    75,
    105,
    4,
    -1,
    true,
    6
  ),
  (
    'aa000000-0000-0000-0000-000000000007',
    'e1000000-0000-0000-0000-000000000001',
    'COQP09',
    'Disaster Management',
    'disaster-management',
    'Master of Science & Technology in Disaster Mitigation and Risk Governance.',
    75,
    105,
    4,
    -1,
    true,
    7
  )
ON CONFLICT (code) DO UPDATE SET
  examination_id = EXCLUDED.examination_id,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 4. SEED INITIAL CHAPTERS FOR EACH SUBJECT (Configurable; supports any count)
-- Political Science Chapters:
INSERT INTO public.chapters (id, subject_id, title, slug, description, display_order, is_active)
VALUES
  ('cb000001-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'Western Political Thought', 'western-political-thought', 'Plato, Aristotle, Machiavelli, Hobbes, Locke, Rousseau, Mill, Marx', 1, true),
  ('cb000001-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000001', 'Indian Political Thought', 'indian-political-thought', 'Kautilya, Gandhi, Ambedkar, Tilak, Aurobindo, Jayaprakash Narayan', 2, true),
  ('cb000001-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000001', 'Political Theory & Concepts', 'political-theory-concepts', 'Liberty, Equality, Justice, Sovereignty, Rights, Democracy, Power', 3, true),
  ('cb000001-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000001', 'Comparative Politics & Analysis', 'comparative-politics', 'Constitutional regimes, electoral systems, political parties, federalism', 4, true),
  ('cb000001-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000001', 'Indian Government & Politics', 'indian-government-politics', 'Preamble, Fundamental Rights, Judiciary, Executive, Parliament, Federal dynamics', 5, true),
  ('cb000001-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000001', 'Public Policy in India', 'public-policy-india', 'Policy formulation, implementation, governance models, socio-economic welfare', 6, true),
  ('cb000001-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000001', 'International Relations & Global Affairs', 'international-relations', 'Realism, Liberalism, Constructivism, United Nations, Indian Foreign Policy', 7, true),

-- Philosophy Chapters:
  ('cb000002-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'Classical Indian Epistemology', 'classical-indian-epistemology', 'Pramanas in Nyaya, Vaisesika, Samkhya, Yoga, and Mimamsa', 1, true),
  ('cb000002-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000002', 'Heterodox Traditions', 'heterodox-traditions', 'Buddhism, Jainism, and Carvaka metaphysical critique', 2, true),
  ('cb000002-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003', 'Western Rationalism & Empiricism', 'western-rationalism-empiricism', 'Descartes, Spinoza, Leibniz, Locke, Berkeley, Hume', 3, true),
  ('cb000002-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000004', 'Kantian Critical Philosophy', 'kantian-philosophy', 'Synthetic a priori, transcendental deduction, categorical imperative', 4, true),
  ('cb000002-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000005', 'Normative & Applied Ethics', 'normative-applied-ethics', 'Virtue ethics, deontology, utilitarianism, bioethics, environmental ethics', 5, true),
  ('cb000002-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000006', 'Formal Logic & Argumentation', 'formal-logic', 'Propositional logic, predicate calculus, fallacies, syllogistic deduction', 6, true),
  ('cb000002-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000007', 'Philosophy of Mind & Language', 'philosophy-mind-language', 'Mind-body problem, Frege, Russell, Wittgenstein, semantic theories', 7, true),

-- Psychology Chapters:
  ('cb000003-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'Cognitive Processes & Memory', 'cognitive-processes-memory', 'Perception, attention, working memory, problem solving, decision making', 1, true),
  ('cb000003-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003', 'Biological Bases of Behavior', 'biological-bases-behavior', 'Neurons, neurotransmitters, brain structures, endocrine systems, genetics', 2, true),
  ('cb000003-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003', 'Personality Theories', 'personality-theories', 'Psychodynamic, trait, humanistic, behavioral, and social-cognitive approaches', 3, true),
  ('cb000003-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000003', 'Lifespan Development', 'lifespan-development', 'Prenatal, childhood, adolescence, and adult developmental trajectories', 4, true),
  ('cb000003-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000003', 'Social Psychology & Group Dynamics', 'social-psychology', 'Attitudes, conformity, obedience, prejudice, prosocial behavior', 5, true),
  ('cb000003-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000003', 'Psychopathology & Clinical Interventions', 'psychopathology-interventions', 'Anxiety, mood, psychotic disorders, CBT, psychotherapeutic paradigms', 6, true),
  ('cb000003-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000003', 'Research Methods & Statistics', 'research-methods-statistics', 'Experimental designs, correlation, ANOVA, regression, psychological testing', 7, true),

-- History Chapters:
  ('cb000004-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004', 'Ancient Indian Civilizations', 'ancient-indian-civilizations', 'Harappan civilization, Vedic culture, Mahajanapadas, early urbanization', 1, true),
  ('cb000004-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000004', 'Mauryan & Classical Age', 'mauryan-classical-age', 'Ashoka, Arthashastra, Gupta administration, golden age of art and science', 2, true),
  ('cb000004-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000004', 'Early Medieval & Delhi Sultanate', 'medieval-delhi-sultanate', 'Regional kingdoms, Cholas, Khaljis, Tughlaqs, agrarian institutions', 3, true),
  ('cb000004-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000004', 'Mughal Empire & Regional Powers', 'mughal-empire-regional', 'Mughal statecraft, Mansabdari system, Marathas, Sikhs, Deccan kingdoms', 4, true),
  ('cb000004-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000004', 'Colonialism & Economic Drain', 'colonialism-economic-drain', 'East India Company, land revenue settlements, de-industrialization, revolt of 1857', 5, true),
  ('cb000004-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000004', 'Indian National Movement', 'indian-national-movement', 'Moderate & Extremist phases, Non-Cooperation, Civil Disobedience, Quit India', 6, true),
  ('cb000004-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000004', 'Post-Independence & World History', 'post-independence-world', 'Partition, integration of princely states, Cold War, Non-Aligned Movement', 7, true),

-- Economics Chapters:
  ('cb000005-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000005', 'Consumer Choice & Market Equilibrium', 'consumer-choice-equilibrium', 'Indifference curves, revealed preference, elasticity, welfare economics', 1, true),
  ('cb000005-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000005', 'Production, Costs, & Market Forms', 'production-costs-market-forms', 'Perfect competition, monopoly, oligopoly, game theory, price discrimination', 2, true),
  ('cb000005-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000005', 'Macroeconomic Models & IS-LM', 'macroeconomic-models-islm', 'Classical vs Keynesian systems, aggregate demand, monetary transmission', 3, true),
  ('cb000005-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000005', 'Monetary & Fiscal Frameworks', 'monetary-fiscal-frameworks', 'Central banking, inflation dynamics, Philips curve, public debt sustainability', 4, true),
  ('cb000005-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000005', 'Econometric & Statistical Tools', 'econometric-statistical-tools', 'OLS regression, hypothesis testing, multicollinearity, time series', 5, true),
  ('cb000005-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000005', 'International Trade & Finance', 'international-trade-finance', 'Ricardian comparative advantage, Heckscher-Ohlin, tariffs, balance of payments', 6, true),
  ('cb000005-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000005', 'Indian Economic Growth & Reforms', 'indian-economic-reforms', 'Planning era, 1991 structural reforms, agriculture, industry, services sector', 7, true),

-- Geography Chapters:
  ('cb000006-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000006', 'Geomorphology & Tectonics', 'geomorphology-tectonics', 'Plate tectonics, volcanism, weathering, fluvial, glacial, and aeolian landforms', 1, true),
  ('cb000006-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000006', 'Climatology & Atmospheric Dynamics', 'climatology-atmospheric-dynamics', 'Insolation, pressure belts, monsoon circulation, cyclones, Köppen classification', 2, true),
  ('cb000006-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000006', 'Oceanography & Marine Resources', 'oceanography-marine-resources', 'Ocean floor topography, temperature-salinity distribution, tides, currents', 3, true),
  ('cb000006-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000006', 'Human & Population Geography', 'human-population-geography', 'Demographic transition, migration models, urban settlements, central place theory', 4, true),
  ('cb000006-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000006', 'Economic & Regional Geography', 'economic-regional-geography', 'Agricultural typologies, Weber industrial location, globalization corridors', 5, true),
  ('cb000006-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000006', 'Geography of India', 'geography-of-india', 'Physiographic divisions, drainage systems, soils, natural vegetation, minerals', 6, true),
  ('cb000006-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000006', 'Cartography, GIS & Remote Sensing', 'cartography-gis-remote-sensing', 'Map projections, aerial photography, satellite sensors, GIS spatial analysis', 7, true),

-- Disaster Management Chapters:
  ('cb000007-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000007', 'Foundations of Hazards & Risk', 'foundations-hazards-risk', 'Hazard vs disaster, vulnerability assessment, risk matrices, capacity analysis', 1, true),
  ('cb000007-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000007', 'Geological & Tectonic Disasters', 'geological-tectonic-disasters', 'Earthquake engineering, microzonation, landslide mitigation, tsunami warnings', 2, true),
  ('cb000007-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000007', 'Hydrometeorological Emergencies', 'hydrometeorological-emergencies', 'Flood management, flash floods, tropical cyclones, drought monitoring', 3, true),
  ('cb000007-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000007', 'Technological & CBRN Disasters', 'technological-cbrn-disasters', 'Industrial hazards, hazardous materials, chemical spills, radiological incidents', 4, true),
  ('cb000007-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000007', 'Global Risk Frameworks', 'global-risk-frameworks', 'Sendai Framework for DRR (2015-2030), Hyogo Framework, climate adaptation', 5, true),
  ('cb000007-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000007', 'Indian Disaster Management Architecture', 'indian-dm-architecture', 'Disaster Management Act 2005, NDMA, SDMA, NDRF, Incident Response System', 6, true),
  ('cb000007-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000007', 'Resilient Recovery & Reconstruction', 'resilient-recovery-reconstruction', 'Build Back Better, post-disaster needs assessment, psychosocial rehabilitation', 7, true)
ON CONFLICT (subject_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 5. SEED INITIAL REAL TESTS (One sectional test per subject + full length diagnostic)
INSERT INTO public.tests (id, subject_id, chapter_id, category_id, title, slug, description, instructions, duration_seconds, positive_marks_default, negative_marks_default, access_type, status, display_order, version)
VALUES
  (
    'da000001-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000001',
    'cb000001-0000-0000-0000-000000000001',
    'ca000000-0000-0000-0000-000000000001',
    'Western Political Thought Sectional 01',
    'pol-sci-western-thought-sec-01',
    'Sectional drill covering classical political thinkers from Plato to Marx.',
    'Official CUET PG marking (+4 for correct, -1 for incorrect). Duration is 30 minutes.',
    1800,
    4,
    1,
    'free',
    'published',
    1,
    1
  ),
  (
    'da000001-0000-0000-0000-000000000002',
    'aa000000-0000-0000-0000-000000000001',
    NULL, -- Subject-level test (No chapter_id)
    'ca000000-0000-0000-0000-000000000002',
    'CUET PG Political Science Full Mock 01',
    'pol-sci-full-mock-01',
    'Comprehensive 75-question timed mock test across all 7 syllabus units.',
    'Full simulation under official 90-minute examination conditions.',
    5400,
    4,
    1,
    'paid',
    'published',
    1,
    1
  ),
  (
    'da000005-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000005',
    'cb000005-0000-0000-0000-000000000001',
    'ca000000-0000-0000-0000-000000000001',
    'Microeconomics: Consumer Choice Sectional 01',
    'econ-consumer-choice-sec-01',
    'Targeted problem set on indifference curves, utility maximization, and elasticity.',
    'Test duration is 30 minutes. +4 for correct, -1 for incorrect.',
    1800,
    4,
    1,
    'free',
    'published',
    1,
    1
  ),
  (
    'da000007-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000007',
    'cb000007-0000-0000-0000-000000000001',
    'ca000000-0000-0000-0000-000000000001',
    'Disaster Concepts & Risk Analysis Sectional 01',
    'dm-concepts-risk-sec-01',
    'Foundational drill on hazard classification and risk vulnerability assessment.',
    '30 minutes timed CBT format.',
    1800,
    4,
    1,
    'free',
    'published',
    1,
    1
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_seconds = EXCLUDED.duration_seconds,
  status = EXCLUDED.status;

-- 6. SEED INITIAL REAL QUESTIONS
INSERT INTO public.questions (id, subject_id, chapter_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, positive_marks, negative_marks, difficulty, status)
VALUES
  (
    'ea000001-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000001',
    'cb000001-0000-0000-0000-000000000001',
    'Who among the following political philosophers characterized the state of nature as "solitary, poor, nasty, brutish, and short"?',
    'John Locke',
    'Thomas Hobbes',
    'Jean-Jacques Rousseau',
    'Baron de Montesquieu',
    'B',
    'Thomas Hobbes in his 1651 masterwork "Leviathan" describes human life in the pre-political state of nature as a perpetual war of all against all, rendering existence solitary, poor, nasty, brutish, and short.',
    4,
    1,
    'moderate',
    'published'
  ),
  (
    'ea000005-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000005',
    'cb000005-0000-0000-0000-000000000001',
    'If the cross-price elasticity of demand between good X and good Y is negative, the two goods are classified as:',
    'Substitutes',
    'Complements',
    'Normal goods',
    'Inferior goods',
    'B',
    'A negative cross-price elasticity indicates that an increase in the price of good Y leads to a decrease in quantity demanded for good X, signifying complementary goods (e.g. cars and petrol).',
    4,
    1,
    'moderate',
    'published'
  ),
  (
    'ea000007-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000007',
    'cb000007-0000-0000-0000-000000000001',
    'Under the Disaster Management Act of 2005 in India, who acts as the ex-officio Chairperson of the National Disaster Management Authority (NDMA)?',
    'Union Home Minister',
    'Cabinet Secretary',
    'Prime Minister of India',
    'Union Minister of Environment and Forests',
    'C',
    'Section 3(2) of the Disaster Management Act, 2005 explicitly designates the Prime Minister of India as the ex-officio Chairperson of the National Disaster Management Authority.',
    4,
    1,
    'moderate',
    'published'
  )
ON CONFLICT (id) DO NOTHING;

-- Link questions to tests
INSERT INTO public.test_questions (id, test_id, question_id, display_order, positive_marks, negative_marks)
VALUES
  ('fa000001-0000-0000-0000-000000000001', 'da000001-0000-0000-0000-000000000001', 'ea000001-0000-0000-0000-000000000001', 1, 4, 1),
  ('fa000005-0000-0000-0000-000000000001', 'da000005-0000-0000-0000-000000000001', 'ea000005-0000-0000-0000-000000000001', 1, 4, 1),
  ('fa000007-0000-0000-0000-000000000001', 'da000007-0000-0000-0000-000000000001', 'ea000007-0000-0000-0000-000000000001', 1, 4, 1)
ON CONFLICT (test_id, question_id) DO NOTHING;
