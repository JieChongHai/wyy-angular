import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Lyric, Song } from '@shared/interfaces/common'
import { forkJoin, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SongService } from 'src/app/services/song.service'

type SongDataModel = [Song, Lyric]
@Injectable()
export class SongInfoResolverService  {
  constructor(private songServ: SongService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SongDataModel> {
    const id = route.paramMap.get('id') || ''
    return forkJoin([
      this.songServ.getSongDetail(id).pipe(map((songs) => songs[0])),
      this.songServ.getLyric(Number(id)),
    ])
  }
}
