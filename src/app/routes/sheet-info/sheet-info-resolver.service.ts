import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { SongSheet } from '@shared/interfaces/common'
import { Observable } from 'rxjs'
import { SheetService } from 'src/app/services/sheet.service'

@Injectable()
export class SheetInfoResolverService  {
  constructor(private sheetServ: SheetService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<SongSheet> {
    return this.sheetServ.getSongSheetDetail(Number(route.paramMap.get('id')))
  }
}
