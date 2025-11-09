import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Guard will handle the authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const { token, user } = req.user;
      
      // Send the response as a post message to the parent window
      res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline';");
      res.send(`
        <script>
          try {
            window.opener.postMessage({
              type: 'oauth_response',
              success: true,
              response: {
                token: '${token}',
                user: ${JSON.stringify(user)}
              }
            }, '${process.env.FRONTEND_URL || 'http://localhost:4200'}');
          } catch (e) {
            console.error('Error posting message:', e);
          }
          window.close();
        </script>
      `);
    } catch (error) {
      console.error('Callback error:', error);
      res.send(`
        <script>
          window.opener.postMessage({
            type: 'oauth_response',
            success: false,
            error: 'Authentication failed'
          }, '${process.env.FRONTEND_URL || 'http://localhost:4200'}');
          window.close();
        </script>
      `);
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // Guard will handle the authentication
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const { token, user } = req.user;
      
      // Send the response as a post message to the parent window
      res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline';");
      res.send(`
        <script>
          try {
            window.opener.postMessage({
              type: 'oauth_response',
              success: true,
              response: {
                token: '${token}',
                user: ${JSON.stringify(user)}
              }
            }, '${process.env.FRONTEND_URL || 'http://localhost:4200'}');
          } catch (e) {
            console.error('Error posting message:', e);
          }
          window.close();
        </script>
      `);
    } catch (error) {
      console.error('Callback error:', error);
      res.send(`
        <script>
          window.opener.postMessage({
            type: 'oauth_response',
            success: false,
            error: 'Authentication failed'
          }, '${process.env.FRONTEND_URL || 'http://localhost:4200'}');
          window.close();
        </script>
      `);
    }
  }
}

