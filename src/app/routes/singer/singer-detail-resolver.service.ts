import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { Singer, SingerDetail } from '@shared/interfaces/common'
import { forkJoin, Observable } from 'rxjs'
import { SingerService } from 'src/app/services/singer.service'

type SingerDetailDataModel = [SingerDetail, Singer[]]

@Injectable()
export class SingerDetailResolverService implements Resolve<SingerDetail> {
  constructor(private singerServ: SingerService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SingerDetail> {
    const id = route.paramMap.get('id') || ''
    // return forkJoin([this.singerServ.getSingerDetail(id), this.singerServ.getSimiSinger(id)])
    return this.singerServ.getSingerDetail(id)
  }
}
