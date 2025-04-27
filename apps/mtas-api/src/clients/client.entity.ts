import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
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

  @OneToMany(() => User, (user) => user.client)
  users: User[];
}

export default Client;
