import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255 })
  email: string;

  @Column('boolean', { default: false })
  is_email_verified: boolean;

  @Column({ length: 255 })
  activate_token: string;

  @Column({ length: 255, nullable: true, default: null })
  reset_password_token?: string;
}
