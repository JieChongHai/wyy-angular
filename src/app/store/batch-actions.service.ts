import { Injectable } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { PlayModeType, Song } from '@shared/interfaces/common'
import { shuffle } from '@shared/untils'
import { NgxStoreModule } from '.'
import { SetCurrentIndex, SetPlayList, SetSongList } from './actions/player.actions'
import { PlayState } from './reducers/player.reducer'
import { getPlayer } from './selectors/player.selectors'

@Injectable({
  providedIn: NgxStoreModule,
})
export class BatchActionsService {
  private playerState!: PlayState

  constructor(private store$: Store<NgxStoreModule>) {
    const appStore$ = this.store$.pipe(select(getPlayer))
    appStore$.subscribe((res) => (this.playerState = res))
  }

  /**
   * 播放歌单
   * @param list 要播放的歌单
   * @param index 某一首歌的索引
   */
  playSheet(list: Song[], index: number) {
    this.store$.dispatch(SetSongList({ songList: list }))
    let newIndex = index
    let songList = list.slice()
    if (this.playerState.playMode.type === PlayModeType.Random) {
      songList = shuffle(list || [])
      newIndex = songList.findIndex((item) => item.id === list[newIndex].id)
    }
    this.store$.dispatch(SetPlayList({ playList: songList }))
    this.store$.dispatch(SetCurrentIndex({ currentIndex: newIndex }))
  }

  /**
   * 删除播放列表里的歌曲
   * @param song 要删除的歌曲
   */
  deleteSong(song: Song) {
    const songList = this.playerState.songList.slice()
    const playList = this.playerState.playList.slice()
    let currIdx = this.playerState.currentIndex

    const sIdx = songList.findIndex((item) => item.id === song.id)
    songList.splice(sIdx, 1)
    const pIdx = playList.findIndex((item) => item.id === song.id)
    playList.splice(pIdx, 1)

    if (currIdx === playList.length || currIdx > pIdx) {
      currIdx--
    }

    this.store$.dispatch(SetSongList({ songList }))
    this.store$.dispatch(SetPlayList({ playList }))
    this.store$.dispatch(SetCurrentIndex({ currentIndex: currIdx }))
  }

  // 清空播放列表
  clearSong() {
    this.store$.dispatch(SetSongList({ songList: [] }))
    this.store$.dispatch(SetPlayList({ playList: [] }))
    this.store$.dispatch(SetCurrentIndex({ currentIndex: -1 }))
  }
}
