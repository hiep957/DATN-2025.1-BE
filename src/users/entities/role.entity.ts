import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // 'ADMIN' | 'STAFF' | 'USER'
  
  @OneToMany(() => UserRole, ur => ur.role)
  userRoles: UserRole[];
}
