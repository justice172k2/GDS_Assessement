import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Registration } from './Registration';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  suspended: boolean;

  @OneToMany(() => Registration, (registration) => registration.student)
  registrations: Registration[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
