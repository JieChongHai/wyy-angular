import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import { ServicesModule } from './services.module';

@Injectable({
  providedIn: ServicesModule,
})
export class StorageCacheService {
  constructor(private platform: Platform) {}

  get(key: string): any {
    if (!this.platform.isBrowser) {
      return null;
    }
    return JSON.parse(localStorage.getItem(key) || 'null') || null;
  }

  set(key: string, value: any): boolean {
    if (!this.platform.isBrowser) {
      return true;
    }
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }

  remove(key: string): void {
    if (!this.platform.isBrowser) {
      return;
    }
    localStorage.removeItem(key);
  }
}
