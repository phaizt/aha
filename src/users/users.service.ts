import * as bcrypt from 'bcrypt';
import * as pass from 'generate-password';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto, isOauth?: boolean): Promise<User> {
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
      const activateToken =
        pass.generate({
          length: 80,
          numbers: true,
        }) + Date.now();

      const data = await this.userRepository.store({
        ...createUserDto,
        password: hash,
        activateToken,
      });
      if (!isOauth) {
        // send email
      }
      return data;
    } catch (error) {
      this.logger.log(`UsersService:create: ${JSON.stringify(error.message)}`);
      throw new Error(error.message);
    }
  }

  findAll() {
    return this.userRepository.findAll();
  }

  findById(id: number) {
    return this.userRepository.findById(id);
  }

  findOne(query: FindOptionsWhere<User>) {
    return this.userRepository.findOneBy(query);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
