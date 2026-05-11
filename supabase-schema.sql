-- ═══════════════════════════════════════════════════════════════
-- GR Educational Consultancy — Supabase Schema v4 (ALL BUGS FIXED)
-- 
-- HOW TO RUN:
-- 1. Go to Supabase → SQL Editor
-- 2. Run CLEANUP first (uncomment lines below) if retrying
-- 3. Paste this ENTIRE file → Click Run
-- 4. See "Success. No rows returned."
-- 5. Then go to Authentication → Add user (admin@greducational.com)
-- ═══════════════════════════════════════════════════════════════

-- ── CLEANUP (uncomment these 5 lines if running again) ──
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;
-- GRANT ALL ON SCHEMA public TO anon, authenticated, service_role;


-- ═══ 1. ENUMS ═══

CREATE TYPE user_role AS ENUM ('student', 'admin', 'teacher');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE test_status AS ENUM ('draft', 'active', 'upcoming', 'archived', 'pending_approval');
CREATE TYPE question_status AS ENUM ('active', 'inactive', 'review');
CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'timed_out');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE student_plan AS ENUM ('free', 'prime');
CREATE TYPE test_access_level AS ENUM ('free', 'prime');
CREATE TYPE assign_type AS ENUM ('all', 'courses', 'streams', 'students');
CREATE TYPE login_provider AS ENUM ('email', 'google', 'phone');
CREATE TYPE teacher_status AS ENUM ('active', 'inactive');
CREATE TYPE student_status AS ENUM ('pending', 'active', 'blocked', 'inactive', 'archived');
CREATE TYPE academic_year_status AS ENUM ('active', 'archived');


-- ═══ 2. COLLEGES ═══

CREATE TABLE colleges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  city TEXT,
  color TEXT DEFAULT '#2563eb',
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO colleges (name, short_name, city, color) VALUES
  ('Fergusson College', 'FC', 'Pune', '#2563eb'),
  ('St. Xavier''s College', 'SXC', 'Mumbai', '#dc2626'),
  ('Symbiosis Institute', 'SI', 'Pune', '#16a34a'),
  ('COEP Technological University', 'COEP', 'Pune', '#7c3aed');


-- ═══ 3. ACADEMIC YEARS ═══

CREATE TABLE academic_years (
  id SERIAL PRIMARY KEY,
  year TEXT NOT NULL UNIQUE,
  start_date DATE,
  end_date DATE,
  status academic_year_status DEFAULT 'active',
  students_count INT DEFAULT 0,
  tests_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO academic_years (year, start_date, end_date, status) VALUES
  ('2024-25', '2024-06-01', '2025-05-31', 'archived'),
  ('2025-26', '2025-06-01', '2026-05-31', 'active');


-- ═══ 4. LOOKUPS ═══

CREATE TABLE exam_modes (
  id SERIAL PRIMARY KEY, value TEXT NOT NULL UNIQUE, label TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false, display_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO exam_modes (value, label, display_order) VALUES
  ('combined','Combined',1),('subject_wise','Subject-wise',2),('chapter_wise','Chapter-wise',3),
  ('mock_test','Mock Test',4),('practice','Practice',5),('previous_year','Previous Year',6);

CREATE TABLE exam_streams (
  id SERIAL PRIMARY KEY, value TEXT NOT NULL UNIQUE, label TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false, display_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO exam_streams (value, label, display_order) VALUES
  ('PCM','PCM',1),('PCB','PCB',2),('PCMB','PCMB',3),('Law','Law',4),('MBA','MBA',5),
  ('Pharmacy','Pharmacy',6),('Nursing','Nursing',7);

CREATE TABLE exam_courses (
  id SERIAL PRIMARY KEY, value TEXT NOT NULL UNIQUE, label TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false, display_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO exam_courses (value, label, display_order) VALUES
  ('CET PCM','CET PCM',1),('CET PCB','CET PCB',2),('JEE','JEE',3),('NEET','NEET',4),
  ('MBA CET','MBA CET',5),('Law Entrance','Law Entrance',6),('B.Pharma','B.Pharma',7),('B.Sc Nursing','B.Sc Nursing',8);

CREATE TABLE student_classes (
  id SERIAL PRIMARY KEY, value TEXT NOT NULL UNIQUE, label TEXT NOT NULL,
  display_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO student_classes (value, label, display_order) VALUES
  ('11','11th Standard',1),('12','12th Standard',2),('repeater','Repeater',3),('dropper','Dropper',4),('graduate','Graduate',5);


-- ═══ 5. PROFILES ═══

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'student',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  mobile TEXT,
  gender TEXT,
  dob DATE,
  stream TEXT,
  course TEXT,
  student_class TEXT,
  city TEXT,
  avatar_url TEXT,
  login_provider login_provider DEFAULT 'email',
  last_login TIMESTAMPTZ,
  plan student_plan DEFAULT 'free',
  plan_name TEXT,
  plan_expiry DATE,
  amount_paid NUMERIC DEFAULT 0,
  plan_start_date DATE,
  parent_name TEXT,
  parent_mobile TEXT,
  college_id INT REFERENCES colleges(id) ON DELETE SET NULL,
  academic_year TEXT DEFAULT '2025-26',
  added_by_teacher INT,
  status student_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- ═══ 6. TEACHERS ═══

CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  username TEXT NOT NULL UNIQUE,
  college_id INT REFERENCES colleges(id) ON DELETE SET NULL,
  subjects INT[],
  permissions TEXT[],
  questions_added INT DEFAULT 0,
  status teacher_status DEFAULT 'active',
  last_login TIMESTAMPTZ,
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ADD CONSTRAINT fk_profiles_teacher
  FOREIGN KEY (added_by_teacher) REFERENCES teachers(id) ON DELETE SET NULL;


-- ═══ 7. SUBJECTS → CHAPTERS → TOPICS ═══

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, code TEXT NOT NULL UNIQUE,
  stream TEXT[], display_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO subjects (name, code, stream, display_order) VALUES
  ('Physics','PHY','{PCM,PCB}',1),('Chemistry','CHE','{PCM,PCB}',2),
  ('Mathematics','MAT','{PCM}',3),('Biology','BIO','{PCB}',4);

CREATE TABLE chapters (
  id SERIAL PRIMARY KEY, subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL, display_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subject_id, name)
);
INSERT INTO chapters (subject_id, name, display_order) VALUES
  (1,'Kinematics',1),(1,'Laws of Motion',2),(1,'Work Energy Power',3),(1,'Gravitation',4),(1,'Optics',5),
  (2,'Chemical Reactions',1),(2,'Chemical Bonding',2),(2,'Ionic Equilibrium',3),(2,'Organic Chemistry',4),
  (3,'Differentiation',1),(3,'Integration',2),(3,'Matrices',3),(3,'Limits',4),(3,'Probability',5);

CREATE TABLE topics (
  id SERIAL PRIMARY KEY, chapter_id INT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE(chapter_id, name)
);


-- ═══ 8. QUESTIONS ═══

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES subjects(id),
  chapter_id INT NOT NULL REFERENCES chapters(id),
  topic_id INT REFERENCES topics(id),
  difficulty difficulty_level DEFAULT 'medium',
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL, option_b TEXT NOT NULL, option_c TEXT NOT NULL, option_d TEXT NOT NULL,
  correct_option INT NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
  solution TEXT, image_url TEXT, marks NUMERIC DEFAULT 1, negative_marks NUMERIC DEFAULT 0,
  status question_status DEFAULT 'active', tags TEXT[],
  created_by_role user_role, created_by_admin UUID, created_by_teacher INT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);


-- ═══ 9. TESTS ═══

CREATE TABLE tests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, description TEXT, mode TEXT DEFAULT 'combined',
  status test_status DEFAULT 'draft', duration_minutes INT DEFAULT 60,
  total_questions INT NOT NULL, marks_per_question NUMERIC DEFAULT 1,
  negative_per_question NUMERIC DEFAULT 0,
  subjects INT[], chapters INT[], difficulty_mix JSONB, method TEXT DEFAULT 'auto',
  access_level test_access_level DEFAULT 'free', is_free BOOLEAN DEFAULT true, price NUMERIC DEFAULT 0,
  stream TEXT, assign_type assign_type DEFAULT 'all',
  assigned_courses TEXT[], assigned_streams TEXT[], assigned_student_ids UUID[],
  available_from TIMESTAMPTZ, available_until TIMESTAMPTZ,
  created_by_role user_role DEFAULT 'admin', created_by_admin UUID, created_by_teacher INT,
  approval_status approval_status DEFAULT 'approved', approval_note TEXT,
  approved_by UUID, approved_at TIMESTAMPTZ,
  academic_year TEXT DEFAULT '2025-26',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE teacher_test_assignments (
  id SERIAL PRIMARY KEY,
  teacher_id INT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  test_id INT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(), UNIQUE(teacher_id, test_id)
);

CREATE TABLE test_questions (
  id SERIAL PRIMARY KEY,
  test_id INT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id),
  question_order INT NOT NULL, section TEXT,
  UNIQUE(test_id, question_id), UNIQUE(test_id, question_order)
);

CREATE TABLE test_csv_questions (
  id SERIAL PRIMARY KEY,
  test_id INT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  subject TEXT, chapter TEXT, difficulty difficulty_level DEFAULT 'medium',
  question_text TEXT NOT NULL, option_a TEXT NOT NULL, option_b TEXT NOT NULL,
  option_c TEXT NOT NULL, option_d TEXT NOT NULL,
  correct_option INT NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
  solution TEXT, question_order INT NOT NULL, created_at TIMESTAMPTZ DEFAULT now()
);


-- ═══ 10. ATTEMPTS & ANSWERS ═══

CREATE TABLE test_attempts (
  id SERIAL PRIMARY KEY,
  test_id INT NOT NULL REFERENCES tests(id),
  student_id UUID NOT NULL REFERENCES profiles(id),
  status attempt_status DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT now(), finished_at TIMESTAMPTZ,
  time_taken_seconds INT, total_questions INT,
  attempted INT DEFAULT 0, correct INT DEFAULT 0, incorrect INT DEFAULT 0, unanswered INT DEFAULT 0,
  score NUMERIC DEFAULT 0, max_score NUMERIC, percentage NUMERIC,
  question_times JSONB, academic_year TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE attempt_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INT NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id),
  selected_option INT, is_marked BOOLEAN DEFAULT false, is_correct BOOLEAN,
  time_spent_seconds NUMERIC DEFAULT 0, answered_at TIMESTAMPTZ,
  UNIQUE(attempt_id, question_id)
);


-- ═══ 11. LOGS ═══

CREATE TABLE whatsapp_share_log (
  id SERIAL PRIMARY KEY,
  attempt_id INT NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id),
  recipient_type TEXT, recipient_phone TEXT, recipient_name TEXT,
  shared_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  actor_role user_role NOT NULL, actor_id TEXT NOT NULL, action TEXT NOT NULL,
  target_type TEXT, target_id TEXT, details JSONB, created_at TIMESTAMPTZ DEFAULT now()
);


-- ═══ 12. PRAGATI TABLES ═══

CREATE TABLE pragati_topic_exams (
  id SERIAL PRIMARY KEY,
  subject_key TEXT NOT NULL, topic_id TEXT NOT NULL, topic_name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('arambh','shikhar','retake_arambh','retake_shikhar')),
  duration_minutes INT DEFAULT 10, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subject_key, topic_id, level)
);

CREATE TABLE pragati_exam_questions (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL REFERENCES pragati_topic_exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL, option_a TEXT NOT NULL, option_b TEXT NOT NULL,
  option_c TEXT NOT NULL, option_d TEXT NOT NULL,
  correct_option INT NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
  solution TEXT, question_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pragati_progress (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id),
  subject_key TEXT NOT NULL, topic_id TEXT NOT NULL,
  arambh_score INT, shikhar_score INT,
  is_activated BOOLEAN DEFAULT false, resource_sent BOOLEAN DEFAULT false,
  resource_link TEXT, status TEXT, updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, subject_key, topic_id)
);


-- ═══ 13. HELPER FUNCTIONS (must be BEFORE RLS policies) ═══

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_teacher() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.teachers WHERE auth_user_id = auth.uid() AND status = 'active');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION current_teacher_id() RETURNS INT AS $$
  SELECT id FROM public.teachers WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;


-- ═══ 14. ROW LEVEL SECURITY ═══

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "profiles_insert_open" ON profiles FOR INSERT WITH CHECK (true);

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "colleges_read" ON colleges FOR SELECT USING (true);
CREATE POLICY "colleges_admin" ON colleges FOR ALL USING (is_admin());

ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "years_read" ON academic_years FOR SELECT USING (true);
CREATE POLICY "years_admin" ON academic_years FOR ALL USING (is_admin());

ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classes_read" ON student_classes FOR SELECT USING (true);
CREATE POLICY "classes_admin" ON student_classes FOR ALL USING (is_admin());

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teachers_admin" ON teachers FOR ALL USING (is_admin());
CREATE POLICY "teachers_own" ON teachers FOR SELECT USING (auth_user_id = auth.uid());

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subjects_read" ON subjects FOR SELECT USING (true);
CREATE POLICY "chapters_read" ON chapters FOR SELECT USING (true);
CREATE POLICY "topics_read" ON topics FOR SELECT USING (true);
CREATE POLICY "subjects_admin" ON subjects FOR ALL USING (is_admin());
CREATE POLICY "chapters_admin" ON chapters FOR ALL USING (is_admin());
CREATE POLICY "topics_admin" ON topics FOR ALL USING (is_admin());

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_read" ON questions FOR SELECT USING (status = 'active');
CREATE POLICY "questions_admin" ON questions FOR ALL USING (is_admin());

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tests_admin" ON tests FOR ALL USING (is_admin());
CREATE POLICY "tests_student_read" ON tests FOR SELECT USING (status = 'active' AND approval_status = 'approved');

ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_csv_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tq_read" ON test_questions FOR SELECT USING (true);
CREATE POLICY "tq_admin" ON test_questions FOR ALL USING (is_admin());
CREATE POLICY "tcq_read" ON test_csv_questions FOR SELECT USING (true);
CREATE POLICY "tcq_admin" ON test_csv_questions FOR ALL USING (is_admin());

ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts_own" ON test_attempts FOR ALL USING (student_id = auth.uid());
CREATE POLICY "attempts_admin" ON test_attempts FOR SELECT USING (is_admin());
CREATE POLICY "answers_own" ON attempt_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM test_attempts WHERE id = attempt_id AND student_id = auth.uid())
);
CREATE POLICY "answers_admin" ON attempt_answers FOR SELECT USING (is_admin());

ALTER TABLE exam_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modes_read" ON exam_modes FOR SELECT USING (true);
CREATE POLICY "streams_read" ON exam_streams FOR SELECT USING (true);
CREATE POLICY "courses_read" ON exam_courses FOR SELECT USING (true);
CREATE POLICY "modes_admin" ON exam_modes FOR ALL USING (is_admin());
CREATE POLICY "streams_admin" ON exam_streams FOR ALL USING (is_admin());
CREATE POLICY "courses_admin" ON exam_courses FOR ALL USING (is_admin());

ALTER TABLE teacher_test_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tta_admin" ON teacher_test_assignments FOR ALL USING (is_admin());

ALTER TABLE whatsapp_share_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wsl_insert" ON whatsapp_share_log FOR INSERT WITH CHECK (true);
CREATE POLICY "wsl_admin" ON whatsapp_share_log FOR SELECT USING (is_admin());
CREATE POLICY "al_admin" ON activity_log FOR SELECT USING (is_admin());

ALTER TABLE pragati_topic_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE pragati_exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pragati_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pte_read" ON pragati_topic_exams FOR SELECT USING (is_active = true);
CREATE POLICY "pte_admin" ON pragati_topic_exams FOR ALL USING (is_admin());
CREATE POLICY "peq_read" ON pragati_exam_questions FOR SELECT USING (true);
CREATE POLICY "peq_admin" ON pragati_exam_questions FOR ALL USING (is_admin());
CREATE POLICY "pp_own" ON pragati_progress FOR ALL USING (student_id = auth.uid());
CREATE POLICY "pp_admin" ON pragati_progress FOR SELECT USING (is_admin());


-- ═══ 15. FUNCTIONS ═══

CREATE OR REPLACE FUNCTION submit_test_attempt(p_attempt_id INT) RETURNS JSONB AS $$
DECLARE v_result JSONB;
BEGIN
  UPDATE attempt_answers aa SET is_correct = (aa.selected_option = q.correct_option)
  FROM questions q WHERE aa.question_id = q.id AND aa.attempt_id = p_attempt_id AND aa.selected_option IS NOT NULL;
  UPDATE test_attempts SET status='completed', finished_at=now(),
    correct=(SELECT COUNT(*) FROM attempt_answers WHERE attempt_id=p_attempt_id AND is_correct=true),
    incorrect=(SELECT COUNT(*) FROM attempt_answers WHERE attempt_id=p_attempt_id AND selected_option IS NOT NULL AND is_correct=false),
    unanswered=(SELECT COUNT(*) FROM attempt_answers WHERE attempt_id=p_attempt_id AND selected_option IS NULL)
  WHERE id=p_attempt_id;
  SELECT jsonb_build_object('attempt_id',id,'correct',correct,'incorrect',incorrect) INTO v_result FROM test_attempts WHERE id=p_attempt_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_student(p_id UUID) RETURNS VOID AS $$
BEGIN UPDATE profiles SET status='active' WHERE id=p_id AND status='pending'; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_student(p_id UUID) RETURNS VOID AS $$
BEGIN UPDATE profiles SET status='blocked' WHERE id=p_id AND status='pending'; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION start_new_academic_year(p_new TEXT, p_archive BOOLEAN DEFAULT true) RETURNS VOID AS $$
DECLARE v_cur TEXT;
BEGIN
  SELECT year INTO v_cur FROM academic_years WHERE status='active' LIMIT 1;
  UPDATE academic_years SET status='archived' WHERE year=v_cur;
  IF p_archive THEN UPDATE profiles SET status='archived' WHERE academic_year=v_cur AND role='student'; END IF;
  INSERT INTO academic_years (year, status) VALUES (p_new, 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══ 16. VIEWS ═══

CREATE OR REPLACE VIEW admin_dashboard_overview AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE role='student') AS total_students,
  (SELECT COUNT(*) FROM profiles WHERE role='student' AND status='active') AS active_students,
  (SELECT COUNT(*) FROM profiles WHERE role='student' AND status='pending') AS pending_students,
  (SELECT COUNT(*) FROM questions WHERE status='active') AS total_questions,
  (SELECT COUNT(*) FROM tests) AS total_tests,
  (SELECT COUNT(*) FROM teachers WHERE status='active') AS active_teachers,
  (SELECT year FROM academic_years WHERE status='active' LIMIT 1) AS current_year;


-- ═══ 17. STORAGE ═══

INSERT INTO storage.buckets (id, name, public) VALUES ('question-images','question-images',true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('college-logos','college-logos',true) ON CONFLICT (id) DO NOTHING;


-- ═══ 18. TRIGGERS ═══

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_teachers_upd BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tests_upd BEFORE UPDATE ON tests FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ═══ 19. AUTO-CREATE PROFILE (LAST — after all tables & policies) ═══

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status, academic_year)
  VALUES (NEW.id, NEW.email, 'student', 'active', '2025-26')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Profile creation skipped for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ═══════════════════════════════════════════
-- DONE! Next steps:
-- 1. Go to Authentication → Add user
--    Email: admin@greducational.com
--    Password: Admin@123
-- 2. Run this SQL:
--    UPDATE profiles SET role='admin', first_name='Super', last_name='Admin'
--    WHERE email='admin@greducational.com';
-- ═══════════════════════════════════════════
