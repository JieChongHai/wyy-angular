import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Banner, HotTag, SongSheet } from '../shared/interfaces/common';
import { API_CONFIG, ServicesModule } from './services.module';

@Injectable({
  providedIn: ServicesModule,
})
export class HomeService {
  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private baseURL: string
  ) {}

  /** 获取 banner( 轮播图 ) 数据 */
  getBanners(): Observable<Banner[]> {
    const url = `${this.baseURL}/banner`;
    return this.http
      .get<{ banners: Banner[] }>(url)
      .pipe(map((res) => res.banners));
  }

  getHotTags(): Observable<HotTag[]> {
    const url = `${this.baseURL}/playlist/hot`;
    return this.http.get<{ tags: HotTag[] }>(url).pipe(
      map((res) => {
        return res.tags
          .sort((x: HotTag, y: HotTag) => x.position - y.position)
          .slice(0, 5);
      })
    );
  }

  getPerosonalSheetList(): Observable<SongSheet[]> {
    const url = `${this.baseURL}/personalized`;
    return this.http
      .get<{ result: SongSheet[] }>(url)
      .pipe(map((res) => res.result.slice(0, 16)));
  }
}
