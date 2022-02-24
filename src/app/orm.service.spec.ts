import { TestBed } from '@angular/core/testing';

import { OrmService } from './orm.service';

describe('ORMService', () => {
  let service: OrmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
