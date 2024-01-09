import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class UpdatePasswordDto {
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

  @IsNotEmpty()
  @MinLength(8)
  old_password: string;
}
