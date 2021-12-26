import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { SampleBack } from '@shared/interfaces/common'
import { LoginParams, User } from '@shared/interfaces/member'
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

  getUserDetail(uid: string): Observable<User> {
    const url = `${this.baseURL}/user/detail`
    const params = new HttpParams({ fromString: stringify({ uid }) })
    return this.http.get<User>(url, { params })
  }
}
