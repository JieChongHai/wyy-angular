import { DOCUMENT } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, Inject } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { shuffle } from '@shared/untils'
import { fromEvent, Subject, Subscription, timer } from 'rxjs'
import { debounceTime, takeUntil } from 'rxjs/operators'
import { NgxStoreModule } from 'src/app/store'
import {
  SetCurrentAction,
  SetCurrentIndex,
  SetPlayList,
  SetPlayMode,
  SetSongList,
} from 'src/app/store/actions/player.actions'
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
import { WyPlayerPanelComponent } from './wy-player-panel/wy-player-panel.component'
import { BatchActionsService } from '@store/batch-actions.service'
import { NzModalService } from 'ng-zorro-antd/modal'
import { animate, state, style, transition, trigger, AnimationEvent } from '@angular/animations'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'

enum PlayerType {
  Show = 'show',
  Hide = 'hide',
}
enum TipTitles {
  Add = '已添加到列表',
  Play = '已开始播放',
}
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
@UntilDestroy()
@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less'],
  animations: [
    trigger('showHide', [
      state('show', style({ bottom: 0 })),
      state('hide', style({ bottom: -71 })),
      transition('show=>hide', [animate('0.3s')]),
      transition('hide=>show', [animate('0.1s')]),
    ]),
  ],
})
export class WyPlayerComponent implements OnInit, AfterViewInit {
  //#region 页面引用
  public PlayerType = PlayerType
  //#endregion
  @ViewChild('audio', { static: true }) private audio!: ElementRef
  @ViewChild(WyPlayerPanelComponent, { static: false }) private playerPanelComp?: WyPlayerPanelComponent
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

  // selfClick = false
  // winClick?: Subscription

  // 是否绑定document click事件
  bindFlag = false

  //#region 底部播放条动画
  showPlayer = PlayerType.Hide
  isLocked = false // 是否锁住底部播放条
  animating = false // 是否正在动画

  controlTooltip = {
    title: '',
    show: false,
  }
  hideTooltip$ = new Subject() // 防止反复弹框
  //#endregion

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store$: Store<NgxStoreModule>,
    @Inject(DOCUMENT) private doc: Document,
    private modal: NzModalService,
    private batchActionsServ: BatchActionsService
  ) {}

  ngOnInit(): void {
    this.initSubscribe()
  }

  ngAfterViewInit(): void {
    this.audioDom = this.audio.nativeElement
    this.audioDom.volume = this.volume
  }

  initSubscribe(): void {
    const appStore$ = this.store$.pipe(select(getPlayer))
    appStore$.pipe(select(getSongList), untilDestroyed(this)).subscribe((list) => (this.songList = list))
    appStore$.pipe(select(getPlayList), untilDestroyed(this)).subscribe((list) => (this.playList = list))
    appStore$.pipe(select(getPlayMode), untilDestroyed(this)).subscribe((mode) => this.watchPlayMode(mode))
    appStore$.pipe(select(getCurrentIndex), untilDestroyed(this)).subscribe((index) => (this.currentIndex = index))
    appStore$.pipe(select(getCurrentSong), untilDestroyed(this)).subscribe((song) => this.watchCurrentSong(song))
    appStore$
      .pipe(select(getCurrentAction), untilDestroyed(this))
      .subscribe((action) => this.watchCurrentAction(action))

    this.hideTooltip$.pipe(untilDestroyed(this)).subscribe(() => {
      timer(1500)
        .pipe(takeUntil(this.hideTooltip$))
        .subscribe(() => {
          this.controlTooltip = {
            title: '',
            show: false,
          }
          timer(300).subscribe(() => this.togglePlayer(PlayerType.Hide))
        })
    })
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
    // this.currentSong = song // 这一行必须执行，无论song是否有值（要包括删除歌曲的情况）
    // if (this.currentSong) {
    //   this.bufferPercent = 0
    //   this.duration = song.dt / 1000
    // }
    if (!song) {
      return
    }
    this.currentSong = song
    this.bufferPercent = 0
    this.duration = song.dt / 1000
  }

  private watchCurrentAction(action: CurrentActions) {
    const title = TipTitles[CurrentActions[action]]
    if (title) {
      this.controlTooltip.title = title
      if (this.showPlayer === PlayerType.Hide) {
        // 主动把播放器弹起，等动画结束后弹出提示框
        this.togglePlayer(PlayerType.Show)
      } else {
        this.showToolTip()
      }
    }
    // 每次变化后重置一下状态，就不会影响到下一次触发
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Other }))
  }

  // 切换底部播放条动画
  togglePlayer(type: PlayerType) {
    if (!this.isLocked && !this.animating) {
      this.showPlayer = type
    }
  }

  onAnimationEvent(event: AnimationEvent) {
    switch (event.phaseName) {
      case 'start':
        this.animating = true
        break
      case 'done':
        this.animating = false
        if (event.toState === PlayerType.Show && this.controlTooltip.title) {
          // 只有在从 hide => show 的情况下才展示 tooltip
          this.showToolTip()
        }
        break

      default:
        break
    }
  }

  showToolTip(autoHide = false) {
    this.controlTooltip.show = true
    this.hideTooltip$.next(autoHide)
  }

  // 跳转详情页
  onToInfo(path: [string, number | undefined]) {
    if (path[1]) {
      this.showVolumnPanel = false
      this.showPanel = false
      this.router.navigate(path, { relativeTo: this.route })
    }
  }

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
    this.bindFlag = this.showPanel || this.showVolumnPanel
    // if (this[type]) {
    //   if (!this.winClick) {
    //     this.winClick = fromEvent(this.doc, 'click').subscribe(() => {
    //       if (this.selfClick) {
    //         this.selfClick = false
    //       } else {
    //         this.showPanel && (this.showPanel = false)
    //         this.showVolumnPanel && (this.showVolumnPanel = false)
    //         this.winClick?.unsubscribe()
    //         this.winClick = undefined
    //       }
    //     })
    //   }
    // } else {
    //   this.winClick?.unsubscribe()
    //   this.winClick = undefined
    // }
  }

  onClickOutSide() {
    this.showVolumnPanel = false
    this.showPanel = false
    this.bindFlag = false
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
      if (this.playerPanelComp) {
        // 单曲循环下歌词也要从头滚动
        this.playerPanelComp.seekLyric(0)
      }
    } else {
      this.onNext(this.currentIndex + 1)
    }
  }

  onError() {
    this.isPlaying = false
    this.bufferPercent = 0
    this.duration = 0
  }
  //#endregion

  // 在播放面板上切换歌曲
  onChangeSong(song: Song): void {
    this.updateCurrentIndex(this.playList, song)
  }

  // 拖动歌曲播放进度
  onPercentChange(per: number) {
    if (!this.currentSong) {
      return
    }
    const currentTime = this.duration * (per / 100)
    this.audioDom.currentTime = currentTime
    if (this.playerPanelComp) {
      this.playerPanelComp.seekLyric(currentTime * 1000)
    }
  }

  // 删除播放列表里的歌曲
  onDeleteSong(song: Song): void {
    this.batchActionsServ.deleteSong(song)
  }

  // 清空播放列表
  onClearSong() {
    this.modal.confirm({
      nzTitle: '确认清空列表？',
      nzOnOk: () => {
        this.batchActionsServ.clearSong()
      },
    })
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
