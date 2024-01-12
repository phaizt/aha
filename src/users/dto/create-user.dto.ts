import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'password must contains at least one lower character, one upper character, one digit character, one special character, minimum 8 characters',
  })
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @MinLength(8)
  password_confirm: string;

  @IsOptional()
  @IsBoolean()
  is_email_verified?: boolean;

  @MinLength(100)
  @IsOptional()
  activate_token?: string;

  @MinLength(100)
  @IsOptional()
  reset_password_token?: string;

  @IsOptional()
  number_of_login?: number;

  @IsOptional()
  @IsDate()
  last_login_at?: Date;

  @IsOptional()
  @IsDate()
  created_at?: Date;

  @IsOptional()
  is_oauth?: boolean;

  @IsOptional()
  is_password_changed?: boolean;
}
