import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core'
import { select, Store } from '@ngrx/store'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { NgxStoreModule } from 'src/app/store'
import {
  getCurrentAction,
  getCurrentIndex,
  getCurrentSong,
  getPlayer,
  getPlayList,
  getPlayMode,
  getSongList,
} from 'src/app/store/selectors/player.selectors'
import { CurrentActions, PlayMode, Song } from '../../interfaces/common'

@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyPlayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('audio', { static: true }) private audio!: ElementRef
  audioDom?: HTMLAudioElement
  songList: Song[] = []
  playList: Song[] = []
  currentIndex?: number
  currentSong?: Song
  volume = 35

  get currentSongURL() {
    return this.currentSong?.url || ''
  }

  destroy$ = new Subject()

  constructor(private store$: Store<NgxStoreModule>) {
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

  ngAfterViewInit(): void {
    this.audioDom = this.audio.nativeElement
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private watchPlayMode(mode: PlayMode) {}

  private watchCurrentSong(song: Song) {
    if (!song) {
      return
    }
    this.currentSong = song
    console.log(this.currentSong.url)
  }

  private watchCurrentAction(action: CurrentActions) {}

  onCanPlay() {
    this.audioDom?.play()
  }
}
