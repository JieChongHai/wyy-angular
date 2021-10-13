import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Singer, SingerParams } from '../shared/interfaces/common';
import { API_CONFIG, ServicesModule } from './services.module';
import { stringify } from 'query-string';

const defaultParams: SingerParams = {
  offset: 0,
  limit: 9,
  cat: '5001',
};

@Injectable({
  providedIn: ServicesModule,
})
export class SingerService {
  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private baseURL: string
  ) {}
  
  /** 入驻歌手分类列表 */ 
  getEnterSinger(args = defaultParams): Observable<Singer[]> {
    const url = `${this.baseURL}/artist/list`;
    const params = new HttpParams({ fromString: stringify(args) });
    return this.http
      .get<{ artists: Singer[] }>(url, { params })
      .pipe(map((res) => res.artists));
  }
}
