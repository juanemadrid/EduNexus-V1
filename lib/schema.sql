-- EduNexus: Esquema de Base de Datos Profesional (Estándar Q10)

-- 1. Usuarios y Roles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Estudiantes
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id),
  document_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended', 'graduated')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Grados y Periodos
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL -- Ejemplo: '11º-A', 'Sexto 2', etc.
);

CREATE TABLE academic_periods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, -- Ejemplo: 'Trimestre 1 2026'
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT false
);

-- 4. Materias y Cursos
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id INTEGER REFERENCES subjects(id),
  level_id INTEGER REFERENCES levels(id),
  teacher_id UUID REFERENCES profiles(id),
  academic_period_id INTEGER REFERENCES academic_periods(id)
);

-- 5. Matrículas (Enrollments)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  level_id INTEGER REFERENCES levels(id),
  academic_period_id INTEGER REFERENCES academic_periods(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Notas Académicas (Grades)
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  course_id UUID REFERENCES courses(id),
  period_id INTEGER REFERENCES academic_periods(id),
  score DECIMAL(3,2) CHECK (score >= 0 AND score <= 5.0),
  comment TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Reportes RIPS (Relacionado con Salud/Facturación)
CREATE TABLE rips_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_code TEXT UNIQUE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);
