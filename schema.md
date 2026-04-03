# EduNexus Database Schema (PostgreSQL/Supabase)

## Tables

### 1. `institutions`
- `id`: uuid (PK)
- `name`: text
- `domain`: text
- `logo_url`: text
- `theme_config`: jsonb
- `created_at`: timestamptz

### 2. `users`
- `id`: uuid (PK, references auth.users)
- `institution_id`: uuid (FK)
- `role`: enum ('ADMIN', 'TEACHER', 'STUDENT', 'FAMILY')
- `full_name`: text
- `email`: text (unique)
- `avatar_url`: text

### 3. `programs` (Carreras/Programas)
- `id`: uuid (PK)
- `institution_id`: uuid (FK)
- `name`: text
- `code`: text

### 4. `courses` (Materias/Módulos)
- `id`: uuid (PK)
- `program_id`: uuid (FK)
- `name`: text
- `credits`: int

### 5. `enrollments` (Matrículas)
- `id`: uuid (PK)
- `student_id`: uuid (FK)
- `program_id`: uuid (FK)
- `status`: enum ('ACTIVE', 'INACTIVE', 'GRADUATED')

### 6. `grades` (Notas/Evaluaciones)
- `id`: uuid (PK)
- `student_id`: uuid (FK)
- `course_id`: uuid (FK)
- `teacher_id`: uuid (FK)
- `score`: decimal
- `percentage`: decimal
- `period`: text (e.g., '2026-1')

### 7. `payments` (Tesorería)
- `id`: uuid (PK)
- `user_id`: uuid (FK)
- `amount`: decimal
- `status`: enum ('PENDING', 'PAID', 'OVERDUE')
- `concept`: text
- `due_date`: date
