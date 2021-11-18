import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Singer, SingerDetail, SingerParams } from '@shared/interfaces/common'
import { API_CONFIG, ServicesModule } from './services.module'
import { stringify } from 'query-string'

const defaultParams: SingerParams = {
  offset: 0,
  limit: 9,
  cat: '5001',
}

@Injectable({
  providedIn: ServicesModule,
})
export class SingerService {
  constructor(private http: HttpClient, @Inject(API_CONFIG) private baseURL: string) {}

  /** 入驻歌手分类列表 */
  getEnterSinger(args = defaultParams): Observable<Singer[]> {
    const url = `${this.baseURL}/artist/list`
    const params = new HttpParams({ fromString: stringify(args) })
    return this.http.get<{ artists: Singer[] }>(url, { params }).pipe(map((res) => res.artists))
  }

  /** 获取歌手详情和热门歌曲 */
  getSingerDetail(id: string): Observable<SingerDetail> {
    const url = `${this.baseURL}/artists`
    const params = new HttpParams().set('id', id)
    return this.http.get<SingerDetail>(url, { params })
  }

  /** 获取相似歌手 */
  getSimiSinger(id: string): Observable<Singer[]> {
    const url = `${this.baseURL}/simi/artist`
    const params = new HttpParams().set('id', id)
    return this.http.get<{ artists: Singer[] }>(url, { params }).pipe(map((res) => res.artists))
  }
}
