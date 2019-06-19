import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

const Jwt = require('jsonwebtoken');

/**
 * 登录校验 守卫
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    let token = context.getArgs()[0].headers.token;
    if(!token) {
      return false;
    }
    try {
      let tokenContent = Jwt.verify(token, '1234');
      console.log(tokenContent)
      return true;
    } catch (err) {
      if(err instanceof Jwt.TokenExpiredError) {
        console.error('token已过时');
      } else if(err instanceof Jwt.JsonWebTokenError) {
        console.error('token无效');
      }
      return false;
    }
  }
}