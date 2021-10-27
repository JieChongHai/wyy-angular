import { DOCUMENT } from '@angular/common'
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, Inject } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { shuffle } from '@shared/untils'
import { fromEvent, Subject, Subscription } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { NgxStoreModule } from 'src/app/store'
import { SetCurrentIndex, SetPlayList, SetPlayMode } from 'src/app/store/actions/player.actions'
import {
  getCurrentAction,
  getCurrentIndex,
  getCurrentSong,
  getPlayer,
  getPlayList,
  getPlayMode,
  getSongList,
} from 'src/app/store/selectors/player.selectors'
import { CurrentActions, PlayMode, PlayModeLabel, PlayModeType, Song } from '@shared/interfaces/common'

const MODE_TYPES: PlayMode[] = [
  {
    type: PlayModeType.Loop,
    label: PlayModeLabel.Loop,
  },
  {
    type: PlayModeType.Random,
    label: PlayModeLabel.Random,
  },
  {
    type: PlayModeType.SingleLoop,
    label: PlayModeLabel.SingleLoop,
  },
]
@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less'],
})
export class WyPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('audio', { static: true }) private audio!: ElementRef
  audioDom!: HTMLAudioElement
  songList: Song[] = []
  playList: Song[] = []
  currentIndex: number = -1
  currentSong?: Song
  currentMode: PlayMode = MODE_TYPES[0] // 当前播放模式（默认为循环播放）
  changeModeCount = 0 // 点击切换播放模式次数

  volume = 0 // 音量
  showVolumnPanel = false // 是否显示音量面板
  showPanel = false // 是否显示列表面板

  duration: number = 0 // 歌曲总时长（秒）
  currentTime: number = 0 // 歌曲当前播放位置（秒）
  isSongReady = false // 是否可以播放
  isPlaying = false // 播放状态
  bufferPercent = 0 // 歌曲缓冲进度
  percent = 0 // 滑块播放进度
  // 歌曲播放地址
  get currentSongURL(): string {
    return this.currentSong?.url || ''
  }

  // 歌曲封面图
  get picUrl(): string {
    return this.currentSong?.al?.picUrl || '//s4.music.126.net/style/web2/img/default/default_album.jpg'
  }

  get audioPreload(): string {
    return this.currentSongURL ? 'metadata' : 'none'
  }

  destroy$ = new Subject()
  selfClick = false
  winClick?: Subscription

  constructor(private store$: Store<NgxStoreModule>, @Inject(DOCUMENT) private doc: Document) {}

  ngOnInit(): void {
    this.initSubscribe()
  }

  ngAfterViewInit(): void {
    this.audioDom = this.audio.nativeElement
    this.audioDom.volume = this.volume
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  initSubscribe(): void {
    const appStore$ = this.store$.pipe(select(getPlayer))
    appStore$.pipe(select(getSongList), takeUntil(this.destroy$)).subscribe((list) => (this.songList = list))
    appStore$.pipe(select(getPlayList), takeUntil(this.destroy$)).subscribe((list) => (this.playList = list))
    appStore$.pipe(select(getPlayMode), takeUntil(this.destroy$)).subscribe((mode) => this.watchPlayMode(mode))
    appStore$.pipe(select(getCurrentIndex), takeUntil(this.destroy$)).subscribe((index) => (this.currentIndex = index))
    appStore$.pipe(select(getCurrentSong), takeUntil(this.destroy$)).subscribe((song) => this.watchCurrentSong(song))
    appStore$
      .pipe(select(getCurrentAction), takeUntil(this.destroy$))
      .subscribe((action) => this.watchCurrentAction(action))
  }

  private watchPlayMode(mode: PlayMode) {
    this.currentMode = mode
    if (this.songList) {
      let list = this.songList.slice()
      if (mode.type === PlayModeType.Random) {
        list = shuffle(list)
      }
      if (this.currentSong) {
        // 切换模式不能影响到现在正在播放的歌曲
        this.updateCurrentIndex(list, this.currentSong)
      }
      this.store$.dispatch(SetPlayList({ playList: list }))
    }
  }

  private watchCurrentSong(song: Song) {
    if (!song) {
      return
    }
    this.currentSong = song
    this.bufferPercent = 0
    this.duration = song.dt / 1000
  }

  private watchCurrentAction(action: CurrentActions) {}

  //#region 左侧3个按钮（操作的是播放列表）
  onPrev(index: number): void {
    const playListLen = this.playList.length
    if (!this.isSongReady || playListLen === 1) {
      return
    }
    const prevIndex = index < 0 ? playListLen - 1 : index // 如果越界，从最后一首开始播放
    this.updateIndex(prevIndex)
  }

  onNext(index: number): void {
    const playListLen = this.playList.length
    if (!this.isSongReady || playListLen === 1) {
      return
    }
    const nextIndex = index >= playListLen ? 0 : index // 如果越界，从第一首开始播放
    this.updateIndex(nextIndex)
  }

  onToggle(): void {
    if (!this.currentSong) {
      // 在没有选择歌曲的情况，自动选一首歌
      if (this.playList.length) {
        this.updateIndex(0)
      }
      return
    }

    if (this.isSongReady) {
      this.isPlaying = !this.isPlaying

      if (this.isPlaying) {
        this.audioDom.play()
      } else {
        this.audioDom?.pause()
      }
    }
  }
  //#endregion

  //#region 右侧4个按钮
  toggleVolumnPanel(): void {
    this.togglePanel('showVolumnPanel')
  }

  toggleListPanel(): void {
    if (this.songList.length) {
      this.togglePanel('showPanel')
    }
  }

  togglePanel(type: any): void {
    // ;(<any>this[type as keyof this]) = !this[type as keyof this]
    this[type] = !this[type]
    if (this[type]) {
      if (!this.winClick) {
        this.winClick = fromEvent(this.doc, 'click').subscribe(() => {
          if (this.selfClick) {
            this.selfClick = false
          } else {
            this.showPanel && (this.showPanel = false)
            this.showVolumnPanel && (this.showVolumnPanel = false)
            this.winClick?.unsubscribe()
            this.winClick = undefined
          }
        })
      }
    } else {
      this.winClick?.unsubscribe()
      this.winClick = undefined
    }
  }

  onVolumeChange(value: number): void {
    this.audioDom.volume = value / 100
  }

  onChangeMode(): void {
    this.store$.dispatch(SetPlayMode({ playMode: MODE_TYPES[++this.changeModeCount % 3] }))
  }
  //#endregion

  //#region audio events handle
  onCanPlay() {
    this.isSongReady = true
    this.audioDom.play()
    this.isPlaying = true
  }

  onTimeUpdate(e: Event) {
    this.currentTime = (e.target as HTMLAudioElement).currentTime
    this.percent = (this.currentTime / this.duration) * 100
    const buffered = this.audioDom.buffered
    if (buffered.length && this.bufferPercent < 100) {
      this.bufferPercent = (buffered.end(0) / this.duration) * 100
    }
  }

  onEnded() {
    this.isPlaying = false
    if (this.currentMode.type === PlayModeType.SingleLoop) {
      this.audioDom.currentTime = 0
      this.audioDom.play()
      this.isPlaying = true
    } else {
      this.onNext(this.currentIndex + 1)
    }
  }

  onError() {
    this.isPlaying = false
    this.bufferPercent = 0
  }
  //#endregion

  // 在播放面板上切换歌曲
  onChangeSong(song: Song): void {
    this.updateCurrentIndex(this.playList, song)
  }

  onPercentChange(per: number) {
    if (!this.currentSong) {
      return
    }
    const currentTime = this.duration * (per / 100)
    this.audioDom.currentTime = currentTime
    // if (this.playerPanel) {
    //   this.playerPanel.seekLyric(currentTime * 1000);
    // }
  }

  // 更新当前歌曲在播放列表的索引
  private updateIndex(index: number) {
    this.store$.dispatch(SetCurrentIndex({ currentIndex: index }))
    this.isSongReady = false
  }

  // 在切换模式后更新当前歌曲在播放列表的索引
  private updateCurrentIndex(list: Song[], song: Song) {
    const newIndex = list.findIndex((item) => item.id === song.id)
    this.store$.dispatch(SetCurrentIndex({ currentIndex: newIndex }))
  }
}
