import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  constructor() {}

  load(): Observable<void> {
    console.log('StartupService');
    return of();
  }
}
