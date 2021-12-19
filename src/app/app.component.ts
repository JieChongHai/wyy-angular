import { Component } from '@angular/core'
import { Store } from '@ngrx/store'
import { SearchResult, Singer, Song, SongSheet } from '@shared/interfaces/common'
import { isEmptyObject } from '@shared/untils'
import { SetModalType } from '@store/actions/member.actions'
import { ModalTypes } from '@store/reducers/member.reducer'
import { iif, of } from 'rxjs'
import { HomeService } from './services/home.service'
import { NgxStoreModule } from './store'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  ModalTypes = ModalTypes
  title = 'wyy'
  menus = [
    {
      label: '发现',
      path: '/home',
    },
    {
      label: '歌单',
      path: '/sheet',
    },
  ]
  // 关键字搜索数据
  searchData: SearchResult = {}

  constructor(private homeServ: HomeService, private store$: Store<NgxStoreModule>) {}

  //#region 弹框逻辑
  onChangeModalType(modalType = ModalTypes.Default) {
    this.store$.dispatch(SetModalType({ modalType }))
  }
  //#endregion

  onSearch(keyword: string): void {
    iif(() => !!keyword, this.homeServ.search(keyword), of({})).subscribe((res) => {
      this.searchData = this.highlightKeyWords(keyword, res)
    })
  }

  // 高亮查询关键字
  private highlightKeyWords(keywords: string, data: SearchResult): SearchResult {
    if (!isEmptyObject(data)) {
      const reg = new RegExp(keywords, 'ig')
      // order	[ "songs", "artists", "albums", "playlists" ]
      data.order?.forEach((type) => {
        const value = data[type]
        if (value && value.length) {
          value.forEach((item: Singer | SongSheet | Song) => {
            item.name = item.name.replace(reg, '<span class="highlight">$&</span>')
          })
        }
      })
    }
    return data || {}
  }
}
