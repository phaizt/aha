import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, { message: 'password must containt at least one lower character, one upper character, one digit character, one special character, minimum 8 characters' })
    @MinLength(8)
    password: string;

    @IsNotEmpty()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, { message: 'password must containt at least one lower character, one upper character, one digit character, one special character, minimum 8 characters' })
    @MinLength(8)
    password_confirm: string;
}