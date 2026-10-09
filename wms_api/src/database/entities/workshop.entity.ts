import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity.js';

export enum WorkshopStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity({ name: 'workshops' })
@Index('idx_workshops_date_status', ['startAt', 'status'])
export class Workshop {
  @PrimaryGeneratedColumn({ name: 'workshop_id' })
  id!: number;

  @Column({ unique: true, length: 40 })
  code!: string;

  @Column({ length: 180 })
  title!: string;

  @Column({ length: 160 })
  instructor!: string;

  @Column({ name: 'start_at', type: 'datetime' })
  startAt!: Date;

  @Column({ length: 255 })
  location!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ name: 'active_count', type: 'int', default: 0 })
  activeCount!: number;

  @Column({
    type: 'enum',
    enum: WorkshopStatus,
    default: WorkshopStatus.SCHEDULED,
  })
  status!: WorkshopStatus;

  @Column({ name: 'created_by', type: 'int' })
  createdBy!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  creator!: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
