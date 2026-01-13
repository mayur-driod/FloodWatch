import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
      getReports() {
    return [
      {
        id: '1',
        lat: 12.9716,
        lon: 77.5946,
        depth: 'knee',
      },
    ];
  }
}
