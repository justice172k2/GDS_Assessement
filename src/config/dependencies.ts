import { TeacherController } from '../controllers/teacher.controller';
import { StudentRepository } from '../repositories/student.repository';
import { TeacherRepository } from '../repositories/teacher.repository';
import { TeacherService } from '../services/teacher.service';
import { dataSource } from './db';

const teacherRepository = new TeacherRepository(dataSource);
const studentRepository = new StudentRepository(dataSource);
const teacherService = new TeacherService(teacherRepository, studentRepository);

export const teacherController = new TeacherController(teacherService);
