import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
@Index('idx_audit_created_at', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn({ name: 'audit_log_id' })
  id!: number;

  @Column({ name: 'actor_id', type: 'int' })
  actorId!: number;

  @Column({ name: 'entity_type', length: 80 })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'int' })
  entityId!: number;

  @Column({ length: 80 })
  action!: string;

  @Column({ type: 'json', nullable: true })
  details!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
