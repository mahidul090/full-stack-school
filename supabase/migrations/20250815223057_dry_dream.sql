/*
  # Change from Grade/Class to Semester/Technology system

  1. Schema Changes
    - Rename `Grade` table to `Semester`
    - Rename `Class` table to `Technology`
    - Update all foreign key references
    - Update column names to reflect new terminology

  2. Data Migration
    - Preserve existing data with new naming convention
    - Update relationships between tables

  3. Security
    - Maintain existing RLS policies with updated table names
*/

-- First, drop foreign key constraints
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";
ALTER TABLE "Student" DROP CONSTRAINT "Student_gradeId_fkey";
ALTER TABLE "Class" DROP CONSTRAINT "Class_gradeId_fkey";
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_classId_fkey";
ALTER TABLE "Event" DROP CONSTRAINT "Event_classId_fkey";
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_classId_fkey";

-- Rename Grade table to Semester
ALTER TABLE "Grade" RENAME TO "Semester";
ALTER TABLE "Semester" RENAME COLUMN "level" TO "name";

-- Rename Class table to Technology
ALTER TABLE "Class" RENAME TO "Technology";
ALTER TABLE "Technology" RENAME COLUMN "gradeId" TO "semesterId";

-- Update Student table column names
ALTER TABLE "Student" RENAME COLUMN "gradeId" TO "semesterId";
ALTER TABLE "Student" RENAME COLUMN "classId" TO "technologyId";

-- Update Lesson table column names
ALTER TABLE "Lesson" RENAME COLUMN "classId" TO "technologyId";

-- Update Event table column names
ALTER TABLE "Event" RENAME COLUMN "classId" TO "technologyId";

-- Update Announcement table column names
ALTER TABLE "Announcement" RENAME COLUMN "classId" TO "technologyId";

-- Recreate foreign key constraints with new names
ALTER TABLE "Student" ADD CONSTRAINT "Student_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Technology" ADD CONSTRAINT "Technology_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update unique constraint name
ALTER INDEX "Grade_level_key" RENAME TO "Semester_name_key";
ALTER INDEX "Class_name_key" RENAME TO "Technology_name_key";