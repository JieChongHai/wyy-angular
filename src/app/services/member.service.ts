import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { SampleBack, SongSheet } from '@shared/interfaces/common'
import {
  LikeSongParams,
  LoginParams,
  RecordType,
  RecordVal,
  Signin,
  User,
  UserRecord,
  UserSheet,
} from '@shared/interfaces/member'
import { stringify } from 'query-string'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { API_CONFIG, ServicesModule } from './services.module'

@Injectable({
  providedIn: ServicesModule,
})
export class MemberService {
  constructor(private http: HttpClient, @Inject(API_CONFIG) private baseURL: string) {}

  login(formValue: LoginParams): Observable<User> {
    const url = `${this.baseURL}/login/cellphone`
    const params = new HttpParams({ fromString: stringify(formValue) })
    return this.http.get<User>(url, { params })
  }

  logout(): Observable<SampleBack> {
    const url = `${this.baseURL}/logout`
    return this.http.get<SampleBack>(url)
  }

  signin(): Observable<Signin> {
    const url = `${this.baseURL}/daily_signin`
    const params = new HttpParams({ fromString: stringify({ type: 1 }) })
    return this.http.get<Signin>(url, { params })
  }

  getUserDetail(uid: string): Observable<User> {
    const url = `${this.baseURL}/user/detail`
    const params = new HttpParams({ fromString: stringify({ uid }) })
    return this.http.get<User>(url, { params })
  }

  /** 听歌记录 */
  getUserRecord(uid: string, type = RecordType.weekData): Observable<RecordVal[]> {
    const url = `${this.baseURL}/user/record`
    const params = new HttpParams({ fromString: stringify({ uid, type }) })
    return this.http.get<UserRecord>(url, { params }).pipe(map((res) => res[RecordType[type]]))
  }

  /** 用户歌单 */
  getUserSheets(uid: string): Observable<UserSheet> {
    const url = `${this.baseURL}/user/playlist`
    const params = new HttpParams({ fromString: stringify({ uid }) })
    return this.http.get<{ playlist: SongSheet[] }>(url, { params }).pipe(
      map((res) => {
        const list = res.playlist
        return {
          self: list.filter((item) => !item.subscribed),
          subscribed: list.filter((item) => item.subscribed),
        }
      })
    )
  }

  /** 收藏歌手 */
  likeSinger(id: string, t = 1): Observable<number> {
    const url = `${this.baseURL}/artist/sub`
    const params = new HttpParams({ fromString: stringify({ id, t }) })
    return this.http.get<SampleBack>(url, { params }).pipe(map((res) => res.code))
  }

  /** 收藏歌曲 */
  likeSong({ pid, tracks }: LikeSongParams): Observable<number> {
    const url = `${this.baseURL}/playlist/tracks`
    const params = new HttpParams({ fromString: stringify({ pid, tracks, op: 'add' }) })
    return this.http.get<SampleBack>(url, { params }).pipe(map((res) => res.code))
  }

  /** 新建歌单 */
  createSheet(name: string): Observable<string> {
    const url = `${this.baseURL}/playlist/create`
    const params = new HttpParams({ fromString: stringify({ name }) })
    return this.http.get<SampleBack>(url, { params }).pipe(map((res) => String(res.id)))
  }

  /** （收藏/取消收藏）歌单 */
  likeSheet(id: string, t = 1): Observable<number> {
    const url = `${this.baseURL}/playlist/subscribe`
    const params = new HttpParams({ fromString: stringify({ id, t }) })
    return this.http.get<SampleBack>(url, { params }).pipe(map((res) => res.code))
  }
}
