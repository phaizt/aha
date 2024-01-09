import { Controller, Get, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './auth/auth.decorator';

@Controller('google')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Public()
  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    const google = this.appService.googleLogin(req) as any;
    return res.redirect(
      `${process.env.FE_URL}/pages/login?access_token=` +
        google?.user?.access_token,
    );
  }
}
