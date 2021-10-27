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
import { WyScrollComponent } from '../wy-scroll/wy-scroll.component'

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyPlayerPanelComponent implements OnInit, OnChanges {
  @ViewChildren(WyScrollComponent) private wyScroll!: QueryList<WyScrollComponent>

  @Input() playing?: boolean
  @Input() show?: boolean
  @Input() songList?: Song[]
  @Input() currentSong?: Song

  @Output() closePanel = new EventEmitter<void>()
  @Output() changeSong = new EventEmitter<Song>()

  scrollY = 0 // 歌曲播放列表滚轮滚动高度
  currentIndex?: number // 当前播放歌曲在 songList 里的索引

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    const { songList, currentSong, show } = changes
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

        if (this.show) {
          this.scrollToCurrent()
        }
      }
    }

    if (show) {
      // 切换面板显示隐藏
      if (!show.firstChange && this.show) {
        const cb = () => {
          timer().subscribe(() => {
            if (this.currentSong) {
              this.scrollToCurrent(0)
            }
          })
        }
        this.wyScroll.first.refreshScroll(cb)
      }
    }
  }

  ngOnInit(): void {}

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
}
