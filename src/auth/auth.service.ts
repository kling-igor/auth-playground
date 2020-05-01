import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { addDays, compareAsc } from 'date-fns';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { SingleUseCodeEntity } from './single-use-code.entity';
import { SignInUserRequestDto, SignUpUserRequestDto, SignInUserResponseDto, SignUpSocialUserRequestDto } from './dto';

const REFRESH_EXPIRES_IN_DAYS = parseInt(process.env.REFRESH_EXPIRES_IN_DAYS || '');

const makeRefreshToken = () => uuidv4().replace(/\-/g, '');

const hash = async (str: string) => await argon2.hash(str);

const expirationDate = () =>
  new Date(
    addDays(new Date(), REFRESH_EXPIRES_IN_DAYS)
      .toISOString()
      .split('.')
      .shift(),
  );

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SingleUseCodeEntity) private readonly singleUseCodesRepository: Repository<SingleUseCodeEntity>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * singup user
   * @param signUpUserDto
   */
  async signUp(signUpUserDto: SignUpUserRequestDto): Promise<SignInUserResponseDto> {
    let user: UserEntity = await this.userService.getUserByLogin(signUpUserDto.login.toLowerCase());

    if (user) {
      throw new ConflictException(`User with login <${signUpUserDto.login}> already exists`);
    }

    const refreshToken = makeRefreshToken();
    const tokenHash = await hash(refreshToken);

    user = await this.userService.createUser({
      ...signUpUserDto,
      refreshToken: tokenHash,
      expirationDate: expirationDate(),
    });

    return await this.issueNewToken(user);
  }

  /**
   * signin user with social account
   * @param signUpUserDto
   */
  async signUpWithSocial(signUpUserDto: SignUpSocialUserRequestDto): Promise<SignInUserResponseDto> {
    let user = await this.userService.getUserBySocialAccount(signUpUserDto.socialNetwork, signUpUserDto.socialId);
    if (user) {
      throw new ConflictException(
        `User with ${signUpUserDto.socialNetwork} account ${signUpUserDto.socialId} already exists`,
      );
    }

    user = await this.userService.getUserByLogin(signUpUserDto.login);

    const refreshToken = makeRefreshToken();
    const tokenHash = await hash(refreshToken);

    if (!user) {
      user = await this.userService.createUser({
        firstName: signUpUserDto.firstName || '',
        middleName: '',
        lastName: signUpUserDto.lastName || '',
        login: signUpUserDto.login,
        password: '',
        refreshToken: tokenHash,
        expirationDate: expirationDate(),
      });
    }

    this.userService.linkWithSocialAccount(user, signUpUserDto.socialNetwork, signUpUserDto.socialId);

    return await this.issueNewToken(user);
  }

  /**
   * signin user by login, password
   * @param signInUserDto
   */
  async signIn(signInUserDto: SignInUserRequestDto): Promise<SignInUserResponseDto> {
    const user: UserEntity = await this.userService.getUserByLogin(signInUserDto.login.toLowerCase());

    if (!user) {
      throw new NotFoundException('Wrong login or password.');
    }

    const matched = await argon2.verify(user.password, signInUserDto.password);

    if (!matched) {
      throw new NotFoundException('Wrong login or password.');
    }

    return await this.issueNewToken(user);
  }

  /**
   * refresh user JWT
   * @param login
   * @param refreshToken
   */
  async refresh(login: string, refreshToken: string): Promise<SignInUserResponseDto> {
    const user: UserEntity = await this.userService.getUserByLogin(login);
    if (!user) {
      throw new NotFoundException(`Invalid refresh token (user with login '${login}' not found)`);
    }

    const matched = await argon2.verify(user.refreshToken, refreshToken);

    if (!matched) {
      throw new BadRequestException('Invalid refresh token');
    }

    // if the first date is after the second
    if (compareAsc(Date.now(), user.expirationDate) >= 0) {
      throw new UnauthorizedException('Invalid refresh token (token expired)');
    }

    return await this.issueNewToken(user);
  }

  /**
   * issue JWT for user
   * @param user
   */
  async issueNewToken(user: UserEntity): Promise<SignInUserResponseDto> {
    const { id: userId, login, roles = [] } = user;

    // creating a new refresh token
    const newRefreshToken = makeRefreshToken();
    const tokenHash = await hash(newRefreshToken);

    const updated = await this.userService.updateUser({
      id: user.id,
      refreshToken: tokenHash,
      expirationDate: expirationDate(),
    });

    if (!updated) {
      throw new BadRequestException('Unable to issue new refresh token');
    }

    const jwtPayload = { userId, roles: roles.map(({ code }) => code) };

    return {
      login,
      jwt: this.jwtService.sign(jwtPayload),
      refreshToken: newRefreshToken,
    };
  }

  /**
   * signin by single use code
   * @param code
   */
  async siginInWithCode(code: string): Promise<SignInUserResponseDto> {
    const singleUseCodeEntry = await this.singleUseCodesRepository
      .createQueryBuilder('single_use_codes')
      .innerJoinAndSelect('single_use_codes.socialAccount', 'social')
      .where('single_use_codes.code = :code', { code })
      .cache(true)
      .getOne();

    // если не найдена - 404
    if (!singleUseCodeEntry) {
      throw new NotFoundException('Wrong code.');
    }

    if (compareAsc(Date.now(), singleUseCodeEntry.expirationDate) >= 0) {
      // если просрочена - убираем из таблицы
      await this.singleUseCodesRepository
        .createQueryBuilder('single_use_codes')
        .delete()
        .where('single_use_codes.code = :code', { code })
        .execute();
      throw new UnauthorizedException('Invalid code (expired)');
    }

    const {
      socialAccount: { socialName, socialId },
    } = singleUseCodeEntry;

    const user = await this.userService.getUserBySocialAccount(socialName, socialId);

    // иначе формируем jwt
    return await this.issueNewToken(user);
  }
}
