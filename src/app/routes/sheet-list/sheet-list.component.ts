import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { SheetList } from '@shared/interfaces/common'
import { BatchActionsService } from '@store/batch-actions.service'
import { pluck, switchMap } from 'rxjs/operators'
import { SheetParams, SheetService } from 'src/app/services/sheet.service'
import { SongService } from 'src/app/services/song.service'

enum ECatTag {
  Hot = 'hot',
  New = 'new',
}

const DEFAULT_CAT = '全部'

@Component({
  templateUrl: './sheet-list.component.html',
  styleUrls: ['./sheet-list.component.less'],
})
export class SheetListComponent implements OnInit {
  listParams: SheetParams = {
    cat: DEFAULT_CAT,
    order: ECatTag.Hot,
    offset: 1,
    limit: 35,
  }

  sheets?: SheetList
  orderValue = ECatTag.Hot

  orderGroup = [
    {
      label: '热门',
      value: ECatTag.Hot,
    },
    {
      label: '最新',
      value: ECatTag.New,
    },
  ]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sheetServ: SheetService,
    private songServ: SongService,
    private batchActionsServ: BatchActionsService
  ) {}

  ngOnInit(): void {
    this.listParams.cat = this.route.snapshot.queryParamMap.get('cat') || DEFAULT_CAT
    this.getList()
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

  // 切换排序
  onOrderChange(order: ECatTag) {
    this.listParams.order = order
    this.listParams.offset = 1
    this.getList()
  }

  // 切换页码
  onPageChange(page: number) {
    this.listParams.offset = page
    this.getList()
  }

  getList() {
    this.sheetServ.getSheets(this.listParams).subscribe((sheets) => (this.sheets = sheets))
  }
}
