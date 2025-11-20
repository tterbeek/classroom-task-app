-- teachers
CREATE TABLE teachers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  class_name text NOT NULL,
  pin_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- students
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- tasks
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- task_status
CREATE TABLE task_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (student_id, task_id)
);

-- RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "teacher can access own teacher row"
  ON teachers FOR ALL
  USING (id = auth.uid());

CREATE POLICY "teacher manages students"
  ON students FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "teacher manages tasks"
  ON tasks FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "teacher manages task_status"
  ON task_status FOR ALL
  USING (
    student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );
