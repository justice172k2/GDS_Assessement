import { Request, Response } from 'express';
import { TeacherService } from '../services/teacher.service';
import { validate } from '../utils/validation';
import {
  commonStudentsQuerySchema,
  registerSchema,
  retrieveForNotificationsSchema,
  suspendSchema
} from '../schemas/teacher.schema';

export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const payload = validate(registerSchema, req.body);
    await this.teacherService.register(payload.teacher, payload.students);
    res.status(204).send();
  };

  commonStudents = async (req: Request, res: Response): Promise<void> => {
    const query = validate(commonStudentsQuerySchema, req.query);
    const students = await this.teacherService.getCommonStudents(query.teacher);
    res.status(200).json({ students: students.map((student) => student.email) });
  };

  suspend = async (req: Request, res: Response): Promise<void> => {
    const payload = validate(suspendSchema, req.body);
    await this.teacherService.suspendStudent(payload.student);
    res.status(204).send();
  };

  retrieveForNotifications = async (req: Request, res: Response): Promise<void> => {
    const payload = validate(retrieveForNotificationsSchema, req.body);
    const recipients = await this.teacherService.getRecipientsForNotification(
      payload.teacher,
      payload.notification
    );
    res.status(200).json({ recipients });
  };
}
