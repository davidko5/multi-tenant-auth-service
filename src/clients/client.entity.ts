import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  appId: string;

  // Whitelist of trusted redirect URIs
  @Column('simple-array')
  redirectUris: string[];

  @CreateDateColumn()
  createdAt: Date;
}

export default Client;
