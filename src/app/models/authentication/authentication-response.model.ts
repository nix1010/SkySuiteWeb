import { JWTToken } from './jwt-token.model';

export class AuthenticationResponse {
    userId: number;
    accessToken: JWTToken;
}