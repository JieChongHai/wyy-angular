import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { SearchResult } from '@shared/interfaces/common'
import { WySearchDataService } from '../wy-search-data.service'

@Component({
  selector: 'app-wy-search-panel',
  templateUrl: './wy-search-panel.component.html',
  styleUrls: ['./wy-search-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WySearchPanelComponent implements OnInit {
  @Input() searchData?: SearchResult

  constructor(private route: ActivatedRoute, private router: Router, private dataServ: WySearchDataService) {}

  ngOnInit(): void {}

  // 跳转详情页
  onToInfo(path: [string, number | undefined]) {
    if (path[1]) {
      this.dataServ.jump()
      this.router.navigate(path, { relativeTo: this.route })
    }
  }
}
