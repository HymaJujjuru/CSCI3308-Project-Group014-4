-- Create Tables
CREATE TABLE IF NOT EXISTS  EventInfo (
  event_no SERIAL PRIMARY KEY,
  location VARCHAR(120),
  date DATE NOT NULL,
  reoccuring_status boolean NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hidden_users VARCHAR(45),
  course_no INT
);

CREATE TABLE IF NOT EXISTS   Course (
  course_no SERIAL PRIMARY KEY,
  course_name VARCHAR(200) NOT NULL,
  course_code VARCHAR(4) NOT NULL
);

CREATE TABLE IF NOT EXISTS    Student (
  student_no SERIAL PRIMARY KEY,
  student_name VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS    Student_has_EventInfo (
  student_no INT NOT NULL,
  event_no INT NOT NULL,
  PRIMARY KEY (student_no, event_no),
  FOREIGN KEY (student_no) REFERENCES    Student(student_no) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (event_no) REFERENCES    EventInfo(event_no) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS   users(
  username VARCHAR(50) PRIMARY KEY,
  password CHAR(60) NOT NULL
);
