import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  familyId: string;

  @Column()
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  replacedAt: Date | null;

  @Column({ default: false })
  isRevoked: boolean;

  @Column()
  userId: number;

  @Column()
  appId: string;
}
