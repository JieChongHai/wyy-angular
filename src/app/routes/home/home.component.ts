import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { map, pluck, switchMap } from 'rxjs/operators';
import { HomeService } from 'src/app/services/home.service';
import { SheetService } from 'src/app/services/sheet.service';
import { SingerService } from 'src/app/services/singer.service';
import { SongService } from 'src/app/services/song.service';
import {
  Banner,
  HotTag,
  Singer,
  SongSheet,
} from 'src/app/shared/interfaces/common';
import { ArrowType } from './components/wy-carousel/wy-carousel.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  // 当前轮播图下标
  activeIndex = 0;
  // 轮播图
  banners: Banner[] = [];
  // 歌单分类
  hotTags: HotTag[] = [];
  // 推荐歌单
  sheetList: SongSheet[] = [];
  // 推荐歌单
  singers: Singer[] = [];

  @ViewChild(NzCarouselComponent, { static: true })
  private nzCarousel!: NzCarouselComponent;

  constructor(
    private route: ActivatedRoute,
    private sheetServ: SheetService,
    private songServe: SongService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(map((res) => res.data))
      .subscribe(([banners, tags, sheetList, singers]) => {
        this.banners = banners;
        this.hotTags = tags;
        this.sheetList = sheetList;
        this.singers = singers;
      });
  }

  onBeforeChange({ from, to }: { from: number; to: number }): void {
    this.activeIndex = to;
  }

  onChangeSlide(type: ArrowType): void {
    this.nzCarousel[type]();
  }

  onPlaySheet(id: number): void {
    this.sheetServ
      .getSongSheetDetail(id)
      .pipe(
        pluck('tracks'),
        switchMap((tracks) => this.songServe.getSongList(tracks))
      )
      .subscribe((res) => {
        console.log(res);
      });
  }
}
