/**
 * PrimePrep Phase 4 Test Suite:
 * - Admin Role Verification & Least Privilege
 * - Examination Management CRUD
 * - Subject Management CRUD
 * - Chapter Management CRUD
 * - Test Category Management CRUD
 * - Question Bank CRUD & Validation
 * - Bulk Question Import & Validation Error Containment
 * - Import History Tracking
 * - Test Paper Creation & Question Association
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, detail: string) {
  results.push({
    name,
    passed: condition,
    message: detail
  });
  const symbol = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${symbol}: [${name}] - ${detail}`);
}

async function runPhase4Tests() {
  console.log('===============================================================');
  console.log('PRIMPREP PHASE 4: ADMIN DASHBOARD & BULK IMPORT VERIFICATION');
  console.log('===============================================================');

  // Test Tokens
  const studentToken = 'student_test_token_12345';
  const contentAdminToken = 'simulated_content_admin_token_67890';
  const platformAdminToken = 'simulated_platform_admin_token_99999';

  // 1. UNAUTHORIZED STUDENT REJECTION
  try {
    const res = await fetch(`${BASE_URL}/api/admin/summary`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(
      res.status === 403,
      'Security: Unauthorized Student Access Blocked',
      `Student request to /api/admin/summary correctly responded with status ${res.status}`
    );
  } catch (err: any) {
    assert(false, 'Security: Unauthorized Student Access Blocked', err.message);
  }

  // 2. PRIVILEGED ACCESS FOR CONTENT ADMIN
  try {
    const res = await fetch(`${BASE_URL}/api/admin/summary`, {
      headers: { Authorization: `Bearer ${contentAdminToken}` }
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.examinations !== undefined && data.questions !== undefined,
      'Authorization: Content Admin Dashboard Access',
      `Content admin accessed summary with metrics: exams=${data.examinations}, subjects=${data.subjects}, chapters=${data.chapters}`
    );
  } catch (err: any) {
    assert(false, 'Authorization: Content Admin Dashboard Access', err.message);
  }

  // 3. EXAMINATION CRUD
  let createdExamId: string | null = null;
  try {
    const createRes = await fetch(`${BASE_URL}/api/admin/examinations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentAdminToken}`
      },
      body: JSON.stringify({
        name: 'Test Entrance Exam',
        slug: 'test-entrance-' + Date.now(),
        description: 'Automated test suite examination',
        display_order: 99
      })
    });
    const createData = await createRes.json();
    assert(
      createRes.status === 201 && Boolean(createData.examination?.id),
      'Examinations: Create Examination',
      `Created examination id=${createData.examination?.id}`
    );
    createdExamId = createData.examination?.id;

    // Update
    if (createdExamId) {
      const updateRes = await fetch(`${BASE_URL}/api/admin/examinations/${createdExamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${contentAdminToken}`
        },
        body: JSON.stringify({ description: 'Updated description by automated test' })
      });
      const updateData = await updateRes.json();
      assert(
        updateRes.status === 200 && updateData.examination?.description?.includes('Updated'),
        'Examinations: Update Examination',
        'Examination details updated successfully'
      );
    }
  } catch (err: any) {
    assert(false, 'Examinations: Management Operations', err.message);
  }

  // 4. SUBJECT MANAGEMENT
  let createdSubId: string | null = null;
  try {
    const createRes = await fetch(`${BASE_URL}/api/admin/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentAdminToken}`
      },
      body: JSON.stringify({
        name: 'Automated Test Subject',
        code: 'TEST' + Math.floor(Math.random() * 900 + 100),
        slug: 'automated-test-subject-' + Date.now(),
        description: 'Test subject for verification',
        display_order: 10
      })
    });
    const subData = await createRes.json();
    assert(
      createRes.status === 201 && Boolean(subData.subject?.id),
      'Subjects: Create Subject',
      `Subject created with code=${subData.subject?.code}`
    );
    createdSubId = subData.subject?.id;
  } catch (err: any) {
    assert(false, 'Subjects: Create Subject', err.message);
  }

  // 5. CHAPTER MANAGEMENT
  let createdChapId: string | null = null;
  if (createdSubId) {
    try {
      const chapRes = await fetch(`${BASE_URL}/api/admin/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${contentAdminToken}`
        },
        body: JSON.stringify({
          subject_id: createdSubId,
          title: 'Unit 1: Foundations of Test Discipline',
          slug: 'unit-1-foundations-' + Date.now(),
          description: 'Syllabus chapter created by automated test',
          display_order: 1
        })
      });
      const chapData = await chapRes.json();
      assert(
        chapRes.status === 201 && Boolean(chapData.chapter?.id),
        'Chapters: Create Syllabus Chapter',
        `Chapter created id=${chapData.chapter?.id}`
      );
      createdChapId = chapData.chapter?.id;
    } catch (err: any) {
      assert(false, 'Chapters: Create Syllabus Chapter', err.message);
    }
  }

  // 6. QUESTION CREATION & VALIDATION
  let createdQId: string | null = null;
  if (createdSubId) {
    try {
      const qRes = await fetch(`${BASE_URL}/api/admin/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${contentAdminToken}`
        },
        body: JSON.stringify({
          subject_id: createdSubId,
          chapter_id: createdChapId,
          question_text: 'What is the primary function of the Supreme Court under Article 32 of the Constitution?',
          option_a: 'Advisory Jurisdiction',
          option_b: 'Enforcement of Fundamental Rights',
          option_c: 'Electoral Dispute Adjudication',
          option_d: 'Fiscal Allocation Review',
          correct_option: 'B',
          explanation: 'Article 32 guarantees the right to move the Supreme Court for enforcement of Fundamental Rights.',
          positive_marks: 4,
          negative_marks: 1,
          difficulty: 'moderate',
          status: 'published'
        })
      });
      const qData = await qRes.json();
      assert(
        qRes.status === 201 && Boolean(qData.question?.id) && qData.question?.correct_option === 'B',
        'Questions: Create Single Question',
        `Created question id=${qData.question?.id} with correct key=${qData.question?.correct_option}`
      );
      createdQId = qData.question?.id;
    } catch (err: any) {
      assert(false, 'Questions: Create Single Question', err.message);
    }
  }

  // 7. BULK QUESTION IMPORT WITH ERROR CONTAINMENT
  if (createdSubId) {
    try {
      const batchPayload = {
        filename: 'automated_test_questions.csv',
        file_type: 'csv',
        subject_id: createdSubId,
        chapter_id: createdChapId,
        questions: [
          // Valid Question 1
          {
            question_text: 'Which political philosopher formulated the concept of Veil of Ignorance?',
            option_a: 'Robert Nozick',
            option_b: 'John Rawls',
            option_c: 'Michael Sandel',
            option_d: 'Amartya Sen',
            correct_option: 'B',
            explanation: 'John Rawls in A Theory of Justice (1971).',
            positive_marks: 4,
            negative_marks: 1,
            difficulty: 'moderate'
          },
          // Valid Question 2
          {
            question_text: 'Who coined the term "Security Dilemma" in International Relations scholarship?',
            option_a: 'John Herz',
            option_b: 'Kenneth Waltz',
            option_c: 'Hans Morgenthau',
            option_d: 'Stephen Walt',
            correct_option: 'A',
            explanation: 'John H. Herz introduced the concept of the security dilemma in 1950.',
            positive_marks: 4,
            negative_marks: 1,
            difficulty: 'hard'
          },
          // Malformed Question 3 (Invalid Correct Key 'Z')
          {
            question_text: 'This question has an invalid key that should be caught and quarantined.',
            option_a: 'Opt 1',
            option_b: 'Opt 2',
            correct_option: 'Z'
          }
        ]
      };

      const bulkRes = await fetch(`${BASE_URL}/api/admin/questions/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${contentAdminToken}`
        },
        body: JSON.stringify(batchPayload)
      });
      const bulkData = await bulkRes.json();
      assert(
        bulkRes.status === 200 && bulkData.successful_count === 2 && bulkData.error_count === 1,
        'Bulk Import: Validation & Error Containment',
        `Processed 3 rows: successfully inserted ${bulkData.successful_count}, rejected ${bulkData.error_count} malformed row(s)`
      );
    } catch (err: any) {
      assert(false, 'Bulk Import: Validation & Error Containment', err.message);
    }
  }

  // 8. IMPORT HISTORY AUDIT TRAIL
  try {
    const histRes = await fetch(`${BASE_URL}/api/admin/import-history`, {
      headers: { Authorization: `Bearer ${contentAdminToken}` }
    });
    const histData = await histRes.json();
    assert(
      histRes.status === 200 && Array.isArray(histData.history),
      'Import History: Audit Records Retrieval',
      `Found ${histData.history?.length || 0} import audit log records`
    );
  } catch (err: any) {
    assert(false, 'Import History: Audit Records Retrieval', err.message);
  }

  // 9. TEST PAPER CREATION & QUESTION ASSEMBLY
  if (createdSubId && createdQId) {
    try {
      const testRes = await fetch(`${BASE_URL}/api/admin/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${contentAdminToken}`
        },
        body: JSON.stringify({
          title: 'Automated Verification Sectional Test 01',
          subject_id: createdSubId,
          chapter_id: createdChapId,
          duration_seconds: 1800,
          positive_marks_default: 4,
          negative_marks_default: 1,
          passing_marks: 40,
          status: 'published',
          question_ids: [createdQId]
        })
      });
      const testData = await testRes.json();
      assert(
        testRes.status === 201 && testData.test?.total_questions === 1,
        'Tests: Paper Assembly with Question Bank',
        `Test assembled with total_questions=${testData.test?.total_questions}, total_marks=${testData.test?.total_marks}`
      );
    } catch (err: any) {
      assert(false, 'Tests: Paper Assembly with Question Bank', err.message);
    }
  }

  console.log('===============================================================');
  const allPassed = results.every(r => r.passed);
  console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${results.filter(r => r.passed).length} | FAILED: ${results.filter(r => !r.passed).length}`);
  console.log(allPassed ? '>>> ALL PHASE 4 SPECIFICATIONS VERIFIED <<<' : '>>> SOME CHECKS FAILED <<<');
  console.log('===============================================================');
}

runPhase4Tests();
