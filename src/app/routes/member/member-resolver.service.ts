import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router } from '@angular/router'
import { EMPTY, forkJoin, Observable } from 'rxjs'
import { MemberService } from 'src/app/services/member.service'
import { RecordVal, User, UserSheet } from '@shared/interfaces/member'

export type CenterData = [User, RecordVal[], UserSheet]

@Injectable({
  providedIn: 'root',
})
export class memberResolverService  {
  constructor(private router: Router, private memberServ: MemberService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CenterData> {
    const uid = route.paramMap.get('id')
    if (!uid) {
      this.router.navigate(['/home'])
      return EMPTY
    }
    return forkJoin([
      this.memberServ.getUserDetail(uid),
      this.memberServ.getUserRecord(uid),
      this.memberServ.getUserSheets(uid),
    ])
  }
}
