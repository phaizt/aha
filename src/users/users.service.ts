import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(private readonly userRepository: UserRepository) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, password_confirm } = createUserDto;
    if (password !== password_confirm) {
      throw new HttpException(
        {
          message: ['Password Confirm must be the same as password'],
          error: 'Bad Request ',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(password, saltOrRounds);

      return this.userRepository.store({ ...createUserDto, password: hash });
    } catch (error) {
      this.logger.log(`UsersService:create: ${JSON.stringify(error.message)}`);
      throw new Error(error.message);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
