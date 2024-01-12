import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryGeneratedColumn('uuid')
  @Column('varchar')
  uuid: string;

  @Column({ length: 255 })
  name: string;

  @Exclude()
  @Column({ length: 255 })
  password: string;

  @Column({ length: 255 })
  email: string;

  @Column('boolean', { default: false })
  is_email_verified: boolean;

  @Column('boolean', { default: false })
  is_oauth: boolean;

  @Column('boolean', { default: false })
  is_password_changed: boolean;

  @Column({ length: 255 })
  activate_token: string;

  @Column({ length: 255, nullable: true, default: null })
  reset_password_token?: string;

  @Column({ nullable: true, default: 0 })
  number_of_login?: number;

  @Column({ type: 'timestamp', default: null })
  created_at?: Date;

  @Column({ type: 'timestamp', default: null })
  last_login_at?: Date;
}
