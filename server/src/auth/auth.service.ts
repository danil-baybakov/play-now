import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './register.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtDto } from './jwt.dto';
import { JwtPayload } from './jwt.payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(credentionals: RegisterDto): Promise<User | null> {
    const user = await this.usersService.findByUsername(credentionals.username);

    if (user) {
      throw new HttpException('Username is already taken', HttpStatus.CONFLICT);
    }

    const hashedPassword = await hash(credentionals.password, 10);

    try {
      const user = { ...credentionals, password: hashedPassword };

      return await this.usersService.create(user);
    } catch (error) {
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validate(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);

    if (user) {
      if (await compare(password, user.password)) {
        return user;
      }
    }

    throw new HttpException(
      'Wrong credentials provided',
      HttpStatus.UNAUTHORIZED,
    );
  }

  async login(user: User): Promise<JwtDto> {
    const payload: JwtPayload = { username: user.username, id: user.id };

    return { access_token: this.jwtService.sign(payload) };
  }
}
