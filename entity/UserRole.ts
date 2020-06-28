import { Role } from './Role';
import { User } from './User';
import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { DiscordEntity } from './concerns/DiscordEntity';
import { IsInt, Min, IsOptional } from 'class-validator';

@Entity()
export class UserRole extends DiscordEntity {
  @ManyToOne('User', 'userRoles', { nullable: false, primary: true, eager: true })
  @JoinColumn()
  user: User;

  @ManyToOne('Role', 'roleUsers', { nullable: false, primary: true, eager: true })
  @JoinColumn()
  role: Role;

  getName(): string {
    if (!this.role || !this.role.channel) return '';

    return Role.getName({ kind: this.role.kind, channel: this.role.channel });
  }
}
