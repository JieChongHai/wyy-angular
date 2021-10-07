import { Injectable } from '@angular/core';
import { NzIconService } from 'ng-zorro-antd/icon';
import { Observable, of } from 'rxjs';
import { ICONS } from 'src/style-icons';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  constructor(iconSrv: NzIconService) {
    iconSrv.addIcon(...ICONS);
  }

  load(): Observable<void> {
    console.log('StartupService');
    return of();
  }
}
