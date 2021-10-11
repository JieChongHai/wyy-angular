import { Component, OnInit, ViewChild } from '@angular/core';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { HomeService } from 'src/app/services/home.service';
import { SingerService } from 'src/app/services/singer.service';
import { Banner, HotTag, Singer, SongSheet } from 'src/app/shared/interfaces/common';
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

  constructor(private homeServ: HomeService,private singerServ: SingerService) {}

  ngOnInit(): void {
    this.homeServ.getBanners().subscribe((banners) => {
      this.banners = banners;
    });
    this.homeServ.getHotTags().subscribe((tags) => {
      this.hotTags = tags;
    });
    this.homeServ.getPerosonalSheetList().subscribe((sheetList) => {
      this.sheetList = sheetList;
    });

    this.singerServ.getEnterSinger().subscribe((singers) => {
      this.singers = singers
    });
  }

  onBeforeChange({ from, to }: { from: number; to: number }): void {
    this.activeIndex = to;
  }

  onChangeSlide(type: ArrowType): void {
    this.nzCarousel[type]()
  }
}
