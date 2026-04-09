import { TeacherController } from '../controllers/teacher.controller';
import { RegistrationRepository } from '../repositories/registration.repository';
import { StudentRepository } from '../repositories/student.repository';
import { TeacherRepository } from '../repositories/teacher.repository';
import { TeacherService } from '../services/teacher.service';
import { dataSource } from './db';

const teacherRepository = new TeacherRepository(dataSource);
const studentRepository = new StudentRepository(dataSource);
const registrationRepository = new RegistrationRepository(dataSource);
const teacherService = new TeacherService(
  dataSource,
  teacherRepository,
  studentRepository,
  registrationRepository
);

export const teacherController = new TeacherController(teacherService);
