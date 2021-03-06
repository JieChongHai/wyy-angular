import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Lyric, Song, SongUrl } from '@shared/interfaces/common'
import { API_CONFIG, ServicesModule } from './services.module'

@Injectable({
  providedIn: ServicesModule,
})
export class SongService {
  constructor(private http: HttpClient, @Inject(API_CONFIG) private baseURL: string) {}

  /** 获取音乐 url */
  getSongUrl(ids: string): Observable<SongUrl[]> {
    const url = `${this.baseURL}/song/url`
    const params = new HttpParams().set('id', ids)
    return this.http.get<{ data: SongUrl[] }>(url, { params }).pipe(map((res) => res.data))
  }

  /** 获取带有播放地址的歌单列表 */
  getSongList(songs: Song | Song[]): Observable<Song[]> {
    const songArr = Array.isArray(songs) ? songs.slice() : [songs]
    const ids = songArr.map((item) => item.id).join()
    return this.getSongUrl(ids).pipe(map((urls) => this.generateSongList(songArr, urls)))
  }

  /** 拼接带有播放地址的歌单列表 */
  private generateSongList(songs: Song[] = [], urls: SongUrl[] = []): Song[] {
    const result = [] as Song[]
    songs.forEach((song) => {
      // 找到歌曲对应的播放地址
      const url = urls.find((item) => item.id === song.id)?.url
      if (url) {
        result.push({ ...song, url })
      }
    })
    return result
  }

  /** 获取歌曲详情，(多个id用 , 隔开) */
  getSongDetail(ids: string): Observable<Song> {
    const url = `${this.baseURL}/song/detail`
    const params = new HttpParams().set('ids', ids)
    return this.http.get<{ songs: Song }>(url, { params }).pipe(map((res) => res.songs))
  }

  // 获取歌词
  getLyric(id: number): Observable<Lyric> {
    const url = `${this.baseURL}/lyric`
    const params = new HttpParams().set('id', String(id))
    return this.http.get<{ [key: string]: { lyric: string } }>(url, { params }).pipe(
      map(({ lrc, tlyric }) => {
        return {
          lyric: lrc?.lyric || '',
          tlyric: tlyric?.lyric || '',
        }
      })
    )
  }
}
