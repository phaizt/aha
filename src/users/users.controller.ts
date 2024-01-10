import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Request } from 'express';
import { Public } from '~/auth/auth.decorator';
import { User } from './entities/user.entity';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/resend-email-activation')
  resendEmail(@Req() request: Request) {
    return this.usersService.resendEmailActivation(+(request.user as User).id);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/logged-in-user')
  loggedInUser(@Req() request: Request) {
    return this.usersService.findById(+(request.user as User).id);
  }

  @Get('/stats')
  userStats() {
    return this.usersService.usersStats();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Public()
  @Get('/activate/:token')
  async activateEmail(@Param('token') token: string, @Res() res) {
    await this.usersService.activateEmail(token);
    return res.redirect(`${process.env.FE_URL}/dashboard`);
  }

  @Put('/reset-password')
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() request: Request,
  ) {
    return this.usersService.updatePassword(
      (request.user as User).id,
      updatePasswordDto,
    );
  }

  @Put('/update-profile')
  updateProfile(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update((request.user as User).id, updateUserDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
