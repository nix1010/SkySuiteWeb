import { Role } from '../models/authentication/role.model';

export interface DecodedToken {
    exp: number;
    iat: number;
    nbf: number;
    role: Role[];
}