import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Teacher } from './Teacher';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  suspended: boolean;

  @ManyToMany(() => Teacher, (teacher) => teacher.students)
  teachers: Teacher[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
