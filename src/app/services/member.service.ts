import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { SampleBack, SongSheet } from '@shared/interfaces/common'
import { LoginParams, RecordType, RecordVal, Signin, User, UserRecord, UserSheet } from '@shared/interfaces/member'
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
}
