import { Test, TestingModule } from '@nestjs/testing';
import { OriginServiceService } from './origin-service.service';

describe('OriginServiceService', () => {
  let service: OriginServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OriginServiceService],
    }).compile();

    service = module.get<OriginServiceService>(OriginServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
