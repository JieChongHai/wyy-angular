import { ServicesModule, API_CONFIG } from './services.module'
import { Injectable, Inject } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpParams, HttpClient } from '@angular/common/http'
import { stringify } from 'query-string'
import { SheetList, SongSheet } from '@shared/interfaces/common'
import { map } from 'rxjs/operators'

export interface SheetParams {
  offset: number // 偏移数量, 用于分页
  limit: number // 取出歌单数量
  order: 'new' | 'hot' // 分别对应最新和最热
  cat: string // tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部"
}

@Injectable({
  providedIn: ServicesModule,
})
export class SheetService {
  constructor(private http: HttpClient, @Inject(API_CONFIG) private baseURL: string) {}

  // 获取歌单列表
  getSheets(args: SheetParams): Observable<SheetList> {
    const url = `${this.baseURL}/top/playlist`
    const params = new HttpParams({ fromString: stringify(args) })
    return this.http.get<SheetList>(url, { params })
  }

  /** 获取歌单详情 */
  getSongSheetDetail(id: number): Observable<SongSheet> {
    const url = `${this.baseURL}/playlist/detail`
    const params = new HttpParams().set('id', String(id))
    return this.http.get<{ playlist: SongSheet }>(url, { params }).pipe(map((res) => res.playlist))
  }
}
