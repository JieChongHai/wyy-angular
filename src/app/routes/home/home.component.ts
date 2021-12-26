import { Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { NzCarouselComponent } from 'ng-zorro-antd/carousel'
import { map, pluck, switchMap } from 'rxjs/operators'
import { SheetService } from 'src/app/services/sheet.service'
import { SongService } from 'src/app/services/song.service'
import { Banner, HotTag, Singer, SongSheet } from '@shared/interfaces/common'
import { ArrowType } from './components/wy-carousel/wy-carousel.component'
import { BatchActionsService } from '@store/batch-actions.service'
import { User } from '@shared/interfaces/member'
import { MemberService } from 'src/app/services/member.service'
import { NgxStoreModule } from '@store/index'
import { getMember, getUserId } from '@store/selectors/member.selectors'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'

@UntilDestroy()
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
  // 用户信息
  user?: User

  @ViewChild(NzCarouselComponent, { static: true })
  private nzCarousel!: NzCarouselComponent

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sheetServ: SheetService,
    private songServ: SongService,
    private batchActionsServ: BatchActionsService,
    private memberServ: MemberService,
    private store$: Store<NgxStoreModule>
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(map((res) => res.data)).subscribe(([banners, tags, sheetList, singers]) => {
      this.banners = banners
      this.hotTags = tags
      this.sheetList = sheetList
      this.singers = singers
    })
    this.store$.pipe(select(getMember), select(getUserId), untilDestroyed(this)).subscribe((id) => this.watchUserId(id))
  }

  watchUserId(id: string): void {
    if (!id) {
      this.user = undefined
      return
    }
    this.memberServ.getUserDetail(id).subscribe((user) => (this.user = user))
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
        switchMap((tracks) => this.songServ.getSongList(tracks))
      )
      .subscribe((list) => {
        this.batchActionsServ.playSheet(list, 0)
      })
  }

  // 跳转到歌单详情
  toInfo(id: number) {
    this.router.navigate(['/sheetInfo', id], { relativeTo: this.route })
  }

  onLogin() {
    this.batchActionsServ.controlModal()
  }
}
