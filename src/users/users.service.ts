import * as bcrypt from 'bcrypt';
import * as pass from 'generate-password';
import { Between } from 'typeorm';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { FindOptionsWhere } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Client, SendEmailV3_1, LibraryResponse } from 'node-mailjet';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto, isOauth?: boolean) {
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
      const activate_token =
        pass.generate({
          length: 80,
          numbers: true,
        }) + Date.now();

      const data = await this.userRepository.store({
        ...createUserDto,
        password: hash,
        activate_token,
        created_at: new Date(),
      });
      if (!isOauth) {
        // send email
        const activate_link = `${process.env.BASE_URL}/users/activate/${data.activate_token}`;
        this.mailerService.sendMail({
          to: data.email,
          subject: 'Activate your account',
          html: `<b>welcome</b> <p>Please activate your account in <a href="${activate_link}">here</a>, or copy paste this link to your browser ${activate_link}</p>`,
        });
      }
      return { data, statusCode: HttpStatus.OK };
    } catch (error) {
      this.logger.log(`UsersService:create: ${JSON.stringify(error.message)}`);
      throw new Error(error.message);
    }
  }

  async findAll() {
    const data = await this.userRepository.findAll();
    return { data, statusCode: HttpStatus.OK };
  }

  async findById(id: string) {
    const data = await this.userRepository.findById(id);
    return { data, statusCode: HttpStatus.OK };
  }

  async findOne(query: FindOptionsWhere<User>) {
    const data = await this.userRepository.findOneBy(query);
    return { data, statusCode: HttpStatus.OK };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data = await this.userRepository.updateOne(id, updateUserDto);
    return { data, statusCode: HttpStatus.OK };
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userRepository.findById(id);
    const { password, password_confirm, old_password } = updatePasswordDto;

    const skipCheckOauth = user.is_oauth && !user.is_password_changed;

    const errorMessage: string[] = [];

    if (password !== password_confirm) {
      errorMessage.push('Password Confirm must be the same as password');
    }

    if (!skipCheckOauth) {
      if (password === old_password) {
        errorMessage.push(
          'New password must be different with the old password',
        );
      }

      const isMatch = await bcrypt.compare(old_password, user.password);
      if (!isMatch) {
        errorMessage.push('Old Password is not match');
      }
    }

    if (errorMessage.length) {
      throw new HttpException(
        {
          message: errorMessage,
          error: 'Bad Request ',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(password, saltOrRounds);
      const data = await this.userRepository.updateOne(id, {
        password: hash,
        is_password_changed: true,
      });
      return { data, statusCode: HttpStatus.OK };
    } catch (error) {
      this.logger.log(`UsersService:create: ${JSON.stringify(error.message)}`);
      throw new Error(error.message);
    }
  }

  async usersStats() {
    const tz = 'Asia/Jakarta';
    const startDateTz = toDate(
      formatInTimeZone(startOfDay(new Date()), tz, 'yyyy-MM-dd HH:mm:ss'),
    );
    const endDateTz = toDate(
      formatInTimeZone(endOfDay(new Date()), tz, 'yyyy-MM-dd HH:mm:ss'),
    );
    const weekAgo = subDays(new Date(), 7);
    const weekAgoTz = toDate(
      formatInTimeZone(startOfDay(weekAgo), tz, 'yyyy-MM-dd HH:mm:ss'),
    );

    const [totalRegister, activeToday, activeWeek] = await Promise.all([
      await this.userRepository.count(),
      await this.userRepository.countBy({
        last_login_at: Between(startDateTz, endDateTz),
      }),
      await this.userRepository.countBy({
        last_login_at: Between(weekAgoTz, endDateTz),
      }),
    ]);

    const avgWeek = (activeWeek / 7).toFixed(2);

    const data = { totalRegister, activeToday, avgWeek };
    return { data, statusCode: HttpStatus.OK };
  }

  async activateEmail(token: string) {
    await this.userRepository.update(
      { activate_token: token },
      { is_email_verified: true },
    );
    return {
      message: ['Your Email has been activated'],
      statusCode: HttpStatus.OK,
    };
  }

  async resendEmailActivation(id: string) {
    const data = await this.userRepository.findById(id);
    const activate_link = `${process.env.BASE_URL}/users/activate/${data.activate_token}`;
    const mailjet = new Client({
      apiKey: process.env.MAIL_USER,
      apiSecret: process.env.MAIL_PASS,
    });
    const body: SendEmailV3_1.Body = {
      Messages: [
        {
          From: {
            Email: process.env.MAIL_FROM,
          },
          To: [
            {
              Email: data.email,
            },
          ],
          Subject: 'Activate your account!!',
          HTMLPart: `<b>welcome</b> <p>Please activate your account in <a href="${activate_link}">here</a>, or copy paste this link to your browser ${activate_link}</p>`,
        },
      ],
    };

    const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
      .post('send', { version: 'v3.1' })
      .request(body);

    const { Status } = result.body.Messages[0];
    // this.mailerService.sendMail({
    //   to: data.email,
    //   subject: 'Activate your account',
    //   html: `<b>welcome</b> <p>Please activate your account in <a href="${activate_link}">here</a>, or copy paste this link to your browser ${activate_link}</p>`,
    // });
    return {
      message: [`Email has been sent ${Status}`, ...result.body.Messages],
      statusCode: HttpStatus.OK,
    };
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
