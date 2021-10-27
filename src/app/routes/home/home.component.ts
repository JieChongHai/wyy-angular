import { Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { NzCarouselComponent } from 'ng-zorro-antd/carousel'
import { Observable } from 'rxjs'
import { map, pluck, switchMap } from 'rxjs/operators'
import { HomeService } from 'src/app/services/home.service'
import { SheetService } from 'src/app/services/sheet.service'
import { SingerService } from 'src/app/services/singer.service'
import { SongService } from 'src/app/services/song.service'
import { Banner, HotTag, PlayModeType, Singer, SongSheet } from '@shared/interfaces/common'
import { NgxStoreModule } from 'src/app/store'
import { SetCurrentIndex, SetPlayList, SetSongList } from 'src/app/store/actions/player.actions'
import { ArrowType } from './components/wy-carousel/wy-carousel.component'
import { getPlayer } from 'src/app/store/selectors/player.selectors'
import { PlayState } from '@store/reducers/player.reducer'
import { shuffle } from '@shared/untils'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  // 当前轮播图下标
  activeIndex = 0
  // 轮播图
  banners: Banner[] = []
  // 歌单分类
  hotTags: HotTag[] = []
  // 推荐歌单
  sheetList: SongSheet[] = []
  // 推荐歌单
  singers: Singer[] = []

  @ViewChild(NzCarouselComponent, { static: true })
  private nzCarousel!: NzCarouselComponent
  private playerState?: PlayState

  constructor(
    private route: ActivatedRoute,
    private sheetServ: SheetService,
    private songServe: SongService,
    private store$: Store<NgxStoreModule>
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(map((res) => res.data)).subscribe(([banners, tags, sheetList, singers]) => {
      this.banners = banners
      this.hotTags = tags
      this.sheetList = sheetList
      this.singers = singers
    })

    const appStore$ = this.store$.pipe(select(getPlayer))
    appStore$.subscribe((res) => (this.playerState = res))
  }

  onBeforeChange({ from, to }: { from: number; to: number }): void {
    this.activeIndex = to
  }

  onChangeSlide(type: ArrowType): void {
    this.nzCarousel[type]()
  }

  onPlaySheet(id: number): void {
    this.sheetServ
      .getSongSheetDetail(id)
      .pipe(
        pluck('tracks'),
        switchMap((tracks) => this.songServe.getSongList(tracks))
      )
      .subscribe((list) => {
        this.store$.dispatch(SetSongList({ songList: list }))
        let newIndex = 0
        let songList = list.slice()
        if (this.playerState?.playMode.type === PlayModeType.Random) {
          songList = shuffle(list || [])
          newIndex = songList.findIndex((item) => item.id === list[newIndex].id)
        }
        this.store$.dispatch(SetPlayList({ playList: songList }))
        this.store$.dispatch(SetCurrentIndex({ currentIndex: newIndex }))
      })
  }
}
