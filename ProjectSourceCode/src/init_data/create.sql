CREATE DATABASE IF NOT EXISTS calendar_db;
-- Create Tables
CREATE TABLE IF NOT EXISTS  EventInfo (
  event_no SERIAL PRIMARY KEY,
  location VARCHAR(120),
  date DATE NOT NULL,
  filter_no INT,
  reoccuring_status boolean NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hidden_users VARCHAR(45),
  course_no INT,
  organizer_no VARCHAR(45) NOT NULL,
  UNIQUE (course_no)
);

CREATE TABLE IF NOT EXISTS   Course (
  course_no SERIAL PRIMARY KEY,
  course_name VARCHAR(45) NOT NULL,
  EventInfo_event_no INT NOT NULL,
  FOREIGN KEY (EventInfo_event_no) REFERENCES EventInfo(event_no) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS   Organizer (
  organizer_no SERIAL PRIMARY KEY,
  organizer_name VARCHAR(120) NOT NULL,
  event_no INT NOT NULL,
  UNIQUE (event_no),
  FOREIGN KEY (event_no) REFERENCES    EventInfo(event_no) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS    Student (
  student_no SERIAL PRIMARY KEY,
  student_name VARCHAR(120) NOT NULL,
  username VARCHAR(50) PRIMARY KEY,
  password CHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS    Filters (
  filter_no SERIAL PRIMARY KEY,
  filter_name VARCHAR(45) NOT NULL,
  EventInfo_event_no INT NOT NULL,
  FOREIGN KEY (EventInfo_event_no) REFERENCES    EventInfo(event_no) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS    Organizer_has_Student (
  Organizer_organizer_no INT NOT NULL,
  Student_student_no INT NOT NULL,
  PRIMARY KEY (Organizer_organizer_no, Student_student_no),
  FOREIGN KEY (Organizer_organizer_no) REFERENCES    Organizer(organizer_no) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (Student_student_no) REFERENCES    Student(student_no) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS    Student_has_EventInfo (
  Student_student_no INT NOT NULL,
  EventInfo_event_no INT NOT NULL,
  PRIMARY KEY (Student_student_no, EventInfo_event_no),
  FOREIGN KEY (Student_student_no) REFERENCES    Student(student_no) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (EventInfo_event_no) REFERENCES    EventInfo(event_no) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS    Organizer_has_EventInfo (
  Organizer_organizer_no INT NOT NULL,
  EventInfo_event_no INT NOT NULL,
  PRIMARY KEY (Organizer_organizer_no, EventInfo_event_no),
  FOREIGN KEY (Organizer_organizer_no) REFERENCES    Organizer(organizer_no) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (EventInfo_event_no) REFERENCES    EventInfo(event_no) ON DELETE NO ACTION ON UPDATE NO ACTION
);


