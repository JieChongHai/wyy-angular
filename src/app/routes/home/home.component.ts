import { Component, OnInit, ViewChild } from '@angular/core';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { HomeService } from 'src/app/services/home.service';
import { Banner, HotTag, SongSheet } from 'src/app/shared/interfaces/common';
import { ArrowType } from './components/wy-carousel/wy-carousel.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  // 当前轮播图下标
  activeIndex = 0;
  // 轮播数据
  banners: Banner[] = [];
  hotTags: HotTag[] = [];
  sheetList: SongSheet[] = [];

  @ViewChild(NzCarouselComponent, { static: true })
  private nzCarousel!: NzCarouselComponent;

  constructor(private homeServ: HomeService) {}

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
  }

  onBeforeChange({ from, to }: { from: number; to: number }): void {
    this.activeIndex = to;
  }

  onChangeSlide(type: ArrowType): void {
    this.nzCarousel[type]()
  }
}
