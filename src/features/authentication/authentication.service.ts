import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IGenericDataServices } from "src/core/generics/generic-data.services";

@Injectable()
export class AuthenticationService {
  constructor(private dataServices: IGenericDataServices, private jwtService: JwtService) {}
}