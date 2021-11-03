import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { Song } from '@shared/interfaces/common'
import { timer } from 'rxjs'
import { SongService } from 'src/app/services/song.service'
import { WyScrollComponent } from '../wy-scroll/wy-scroll.component'
import { BaseLyricLine, WyLyric } from './wy-lyric'

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyPlayerPanelComponent implements OnInit, OnChanges {
  @ViewChildren(WyScrollComponent) private wyScroll!: QueryList<WyScrollComponent>

  @Input() playing?: boolean
  @Input() show?: boolean
  @Input() songList?: Song[]
  @Input() currentSong?: Song

  @Output() closePanel = new EventEmitter<void>()
  @Output() changeSong = new EventEmitter<Song>()
  @Output() deleteSong = new EventEmitter<Song>()
  @Output() clearSong = new EventEmitter<void>()

  scrollY = 0 // 歌曲播放列表滚轮滚动高度
  currentIndex?: number // 当前播放歌曲在 songList 里的索引

  currentLyric?: BaseLyricLine[]
  currentLineNum?: number // 歌曲当前播放的行数

  private lyric?: WyLyric | null
  private lyricRefs?: NodeList | null
  private startLine = 2

  constructor(private songServe: SongService) {}
  ngOnChanges(changes: SimpleChanges): void {
    const { playing, songList, currentSong, show } = changes

    if (playing) {
      if (!playing.firstChange) {
        if (this.lyric) {
          this.lyric.togglePlay(!!this.playing)
        }
      }
    }

    if (songList) {
      // 切换歌单
      if (this.currentSong) {
        this.updateCurrentIndex()
      }
    }

    if (currentSong) {
      // 切换播放的歌曲
      if (this.currentSong) {
        this.updateCurrentIndex()
        this.updateLyric()
        if (this.show) {
          this.scrollToCurrent()
        }
      } else {
        this.resetLyric()
      }
    }

    if (show) {
      // 切换面板显示隐藏
      if (!show.firstChange && this.show) {
        this.wyScroll.first.refreshScroll(() => {
          timer().subscribe(() => {
            if (this.currentSong) {
              this.scrollToCurrent(0)
            }
          })
        })
        this.wyScroll.last.refreshScroll(() => {
          timer().subscribe(() => {
            if (this.lyricRefs) {
              this.scrollToCurrentLyric(0)
            }
          })
        })
      }
    }
  }

  ngOnInit(): void {}

  /** 从指定时间开始滚动歌词，offset 单位为毫秒 */
  seekLyric(offset: number) {
    if (!this.lyric) {
      return
    }
    this.lyric.seek(offset)
  }

  // 滚动到当前正在播放的歌曲
  private scrollToCurrent(speed = 300) {
    const scrollComp = this.wyScroll.first // 滚动组件
    const scrollContainerDom = scrollComp.el.nativeElement // 获取到滚动的容器DOM
    const songListDoms = scrollContainerDom.querySelectorAll('ul>li') // 获取到滚动的容器内的每一条数据的DOM集合
    if (songListDoms.length) {
      const current = songListDoms[this.currentIndex || 0] as HTMLElement
      const { offsetTop, offsetHeight } = current
      // 如果当前歌曲不在当前可视范围的上下界以内，则滚动到目标歌曲的位置
      if (offsetTop - Math.abs(this.scrollY) > offsetHeight * 5 || offsetTop < Math.abs(this.scrollY)) {
        scrollComp.scrollToElement(current, speed, false, false)
      }
    }
  }

  // 更新当前播放的歌曲索引
  private updateCurrentIndex() {
    this.currentIndex = this.songList?.findIndex((item) => item.id === this.currentSong?.id)
  }

  // 获取当前播放歌曲的歌词
  private updateLyric() {
    this.resetLyric()
    if (this.currentSong) {
      const { id } = this.currentSong
      this.songServe.getLyric(id).subscribe((res) => {
        // 转换一下歌词对象
        this.lyric = new WyLyric(res)
        this.currentLyric = this.lyric.lines
        console.log('currentLyric', this.currentLyric)
        this.startLine = res.tlyric ? 1 : 3;
        this.handleLyric()
        this.wyScroll.last.scrollTo(0, 0)
        if (this.playing) {
          this.lyric.play()
        }
      })
    }
  }

  // 订阅 WyLyric 发射出来的播放行数
  private handleLyric() {
    if (!this.lyric) {
      return
    }
    this.lyric.handler$.subscribe(({ lineNum }) => {
      console.log('lineNum', lineNum)
      const scrollComp = this.wyScroll.last // 滚动组件

      if (!this.lyricRefs) {
        this.lyricRefs = scrollComp.el.nativeElement.querySelectorAll('ul li')
      }

      if (this.lyricRefs?.length) {
        this.currentLineNum = lineNum
        if (lineNum > this.startLine) {
          // 歌曲快播放到中心位置的时候再滚动
          this.scrollToCurrentLyric(300)
        } else {
          scrollComp.scrollTo(0, 0)
        }
      }
    })
  }

  private resetLyric() {
    if (!this.lyric) {
      return
    }
    this.lyric.stop()
    this.lyric = null
    this.currentLyric = []
    this.currentLineNum = 0
    this.lyricRefs = null
  }

  // 滚动到当前正在播放的歌曲对应的歌词行
  private scrollToCurrentLyric(speed = 300) {
    if (!this.lyricRefs) {
      return
    }
    const scrollComp = this.wyScroll.last // 滚动组件
    const targetLine = this.lyricRefs[(this.currentLineNum || 0) - this.startLine] as HTMLElement
    if (targetLine) {
      scrollComp.scrollToElement(targetLine, speed, false, false)
    }
  }
}
