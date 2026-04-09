import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Student } from './Student';
import { Teacher } from './Teacher';

@Entity('registrations')
@Unique(['teacherId', 'studentId'])
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'teacher_id', type: 'varchar', length: 36 })
  teacherId: string;

  @Column({ name: 'student_id', type: 'varchar', length: 36 })
  studentId: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.registrations)
  @JoinColumn({ name: 'teacher_id', referencedColumnName: 'id' })
  teacher: Teacher;

  @ManyToOne(() => Student, (student) => student.registrations)
  @JoinColumn({ name: 'student_id', referencedColumnName: 'id' })
  student: Student;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
