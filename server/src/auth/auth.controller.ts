import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
  Request,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './login.dto';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterDto } from './register.dto';
import { AuthService } from './auth.service';
import { JwtDto } from './jwt.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiCreatedResponse({ description: 'User has been created', type: JwtDto })
  @ApiConflictResponse({ description: 'Username is already taken' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  @ApiBody({ type: RegisterDto })
  async register(
    @Body(ValidationPipe) credentials: RegisterDto,
  ): Promise<JwtDto> {
    const user = await this.authService.register(credentials);

    return this.authService.login(user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiOkResponse({ description: 'User login', type: JwtDto })
  @ApiUnauthorizedResponse({ description: 'Wrong credentials provided' })
  @ApiBody({ type: LoginDto })
  async login(
    @Request() req,
    @Body(ValidationPipe) credentials: LoginDto,
  ): Promise<JwtDto> {
    return this.authService.login(req.user);
  }
}
