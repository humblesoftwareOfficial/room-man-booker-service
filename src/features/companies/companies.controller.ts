import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../authentication/jwt.auth.guard";
import { CompaniesService } from "./companies.service";
import { Company } from "src/core/entities/companies/companies.entity";
import { NewCompanyDto } from "src/core/entities/companies/companies.dto";
import { GetStatsByCompany } from "src/core/entities/places/places.dto";

@ApiTags('Companies')
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private service: CompaniesService) {}

  @ApiCreatedResponse({
    description: 'New company successfully registered.',
    type: Company,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. most often duplicated values such as name.',
  })
  @Post('/')
  async create(@Body() data: NewCompanyDto) {
    return this.service.create(data);
  }

  @ApiCreatedResponse({
    description: 'New company successfully registered.',
    type: Company,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. most often duplicated values such as name.',
  })
  @Post('/stats')
  async stats(@Body() data: GetStatsByCompany) {
    return this.service.stats(data);
  }
}