import { Injectable } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { CurrentActions, PlayModeType, Singer, Song, SongSheet } from '@shared/interfaces/common'
import { ShareType } from '@shared/interfaces/member'
import { shuffle } from '@shared/untils'
import { timer } from 'rxjs'
import { NgxStoreModule } from '.'
import { SetLikeId, SetModalType, SetModalVisible, SetShareInfo } from './actions/member.actions'
import { SetCurrentAction, SetCurrentIndex, SetPlayList, SetSongList } from './actions/player.actions'
import { MemberState, ModalTypes } from './reducers/member.reducer'
import { PlayState } from './reducers/player.reducer'
import { getMember } from './selectors/member.selectors'
import { getPlayer } from './selectors/player.selectors'

@Injectable({
  providedIn: NgxStoreModule,
})
export class BatchActionsService {
  private playerState!: PlayState
  private memberState!: MemberState

  constructor(private store$: Store<NgxStoreModule>) {
    this.store$.pipe(select(getPlayer)).subscribe((res) => (this.playerState = res))
    this.store$.pipe(select(getMember)).subscribe((res) => (this.memberState = res))
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
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Play }))
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
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Delete }))
  }

  /** 清空播放列表 */
  clearSong() {
    this.store$.dispatch(SetSongList({ songList: [] }))
    this.store$.dispatch(SetPlayList({ playList: [] }))
    this.store$.dispatch(SetCurrentIndex({ currentIndex: -1 }))
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Clear }))
  }

  /** 往播放列表和歌单列表插入一首歌曲*/
  insertSong(song: Song, isPlay: boolean) {
    const playModeType = this.playerState.playMode.type
    const songList = this.playerState.songList.slice()
    let playList = this.playerState.playList.slice()
    let insertIndex = this.playerState.currentIndex
    const pIndex = playList.findIndex((item) => item.id === song.id)

    if (pIndex > -1) {
      // 歌曲在播放列表里
      isPlay && (insertIndex = pIndex)
    } else {
      // 歌曲不在播放列表里(即也不在歌单列表里)
      songList.push(song)
      isPlay && (insertIndex = songList.length - 1)

      if (playModeType === PlayModeType.Random) {
        playList = shuffle(songList)
      } else {
        playList.push(song)
      }

      this.store$.dispatch(SetSongList({ songList }))
      this.store$.dispatch(SetPlayList({ playList }))
    }

    if (insertIndex !== this.playerState.currentIndex) {
      this.store$.dispatch(SetCurrentIndex({ currentIndex: insertIndex }))
      this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Play }))
    } else {
      this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Add }))
    }
  }

  /** 往播放列表和歌单列表插入多首歌曲*/
  insertSongs(songs: Song[]) {
    const playModeType = this.playerState.playMode.type
    let songList = this.playerState.songList.slice()
    let playList = this.playerState.playList.slice()
    const validSongs = songs.filter((song) => playList.findIndex((item) => item.id === song.id) === -1)
    if (validSongs.length) {
      songList = songList.concat(validSongs)

      let songPlayList = validSongs.slice()
      if (playModeType === PlayModeType.Random) {
        songPlayList = shuffle(songList)
      }
      playList = playList.concat(songPlayList)

      this.store$.dispatch(SetSongList({ songList }))
      this.store$.dispatch(SetPlayList({ playList }))
    }
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Add }))
  }

  //#region Member
  // 会员弹窗显示隐藏/类型
  controlModal(modalVisible = true, modalType?: ModalTypes) {
    if (modalType != null) {
      this.store$.dispatch(SetModalType({ modalType }))
    }
    this.store$.dispatch(SetModalVisible({ modalVisible }))
    if (!modalVisible) {
      timer(500).subscribe(() => this.store$.dispatch(SetModalType({ modalType: ModalTypes.Default })))
    }
  }

  // 收藏歌曲
  likeSong(id: string) {
    this.store$.dispatch(SetModalType({ modalType: ModalTypes.Like }))
    this.store$.dispatch(SetLikeId({ id }))
  }

  // 分享
  shareResource(resource: Song | SongSheet, type = ShareType.Song) {
    let txt = ''
    if (type === ShareType.Playlist) {
      txt = this.makeShareTxt('歌单', resource.name, (resource as SongSheet).creator.nickname)
    } else {
      txt = this.makeShareTxt('歌曲', resource.name, (resource as Song).ar)
    }
    this.store$.dispatch(SetShareInfo({ info: { id: String(resource.id), type, txt } }))
  }

  private makeShareTxt(type: string, name: string, makeBy: string | Singer[]): string {
    const makeByStr = Array.isArray(makeBy) ? makeBy.map((item) => item.name).join('/') : makeBy
    return `${type}: ${name} -- ${makeByStr}`
  }
  //#endregion
}
