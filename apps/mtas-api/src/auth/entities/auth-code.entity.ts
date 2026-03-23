import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuthCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  userId: number;

  @Column()
  redirectUri: string;

  @Column()
  appId: string;

  @Column()
  expiresAt: Date;
}
