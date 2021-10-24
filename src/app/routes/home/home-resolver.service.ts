import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { HomeService } from 'src/app/services/home.service';
import { SingerService } from 'src/app/services/singer.service';
import {
  Banner,
  HotTag,
  Singer,
  SongSheet,
} from '@shared/interfaces/common';

export type HomeData = [Banner[], HotTag[], SongSheet[], Singer[]];

@Injectable({
  providedIn: 'root',
})
export class HomeResolverService implements Resolve<HomeData> {
  constructor(
    private homeServ: HomeService,
    private singerServ: SingerService
  ) {}

  resolve(): Observable<HomeData> {
    return forkJoin([
      this.homeServ.getBanners(),
      this.homeServ.getHotTags(),
      this.homeServ.getPerosonalSheetList(),
      this.singerServ.getEnterSinger(),
    ]).pipe(first());
  }
}
