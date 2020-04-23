import { Injectable, HttpService, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { map } from 'rxjs/operators';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class GoogleService {
  constructor(private readonly http: HttpService, private readonly authService: AuthService) {}

  async signIn(userToken: string): Promise<any> {
    // получаем ключи Google
    const certs = await new Promise((resolve, reject) => {
      this.http
        .get('https://www.googleapis.com/oauth2/v1/certs')
        .pipe(map(response => response.data))
        .subscribe(resolve);
    });

    const [cert] = Object.values(certs);
    console.log(cert);

    let decoded;

    const audience = '582340154298-0rrvj4q5ptdje2mnl8co0t3d2b97s230.apps.googleusercontent.com';
    const issuer = 'https://accounts.google.com';
    try {
      decoded = jwt.verify(userToken, cert, { issuer, audience, algorithms: ['RS256'], ignoreExpiration: true });
    } catch (e) {
      console.log(e);

      throw new BadRequestException('Invalid Google token');
    }

    const { /*iss, aud, */ sub, email, email_verified, given_name, family_name } = decoded;

    console.table(decoded);

    // ищем социальный аккаунт (поле sub) и связанного с ним пользователя
    // авторизуем пользователя

    return null;
  }
}
