import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router'
import { EMPTY, forkJoin, Observable } from 'rxjs'
import { MemberService } from 'src/app/services/member.service'
import { RecordVal, User } from '@shared/interfaces/member'

export type RecordData = [User, RecordVal[]]

@Injectable({
  providedIn: 'root',
})
export class RecordResolverService implements Resolve<RecordData> {
  constructor(private router: Router, private memberServ: MemberService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<RecordData> {
    const uid = route.paramMap.get('id')
    if (!uid) {
      this.router.navigate(['/home'])
      return EMPTY
    }
    return forkJoin([this.memberServ.getUserDetail(uid), this.memberServ.getUserRecord(uid)])
  }
}
