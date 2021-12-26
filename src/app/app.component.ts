import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { SearchResult, Singer, Song, SongSheet } from '@shared/interfaces/common'
import { LoginParams, User } from '@shared/interfaces/member'
import { isEmptyObject } from '@shared/untils'
import { SetModalType, SetUserId } from '@store/actions/member.actions'
import { BatchActionsService } from '@store/batch-actions.service'
import { ModalTypes } from '@store/reducers/member.reducer'
import { NzMessageService } from 'ng-zorro-antd/message'
import { iif, of } from 'rxjs'
import { HomeService } from './services/home.service'
import { MemberService } from './services/member.service'
import { StorageCacheService } from './services/storage-cache.service'
import { codeJson } from './shared/untils/base64'
import { NgxStoreModule } from './store'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
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
  user?: User | null
  wyRememberLogin?: LoginParams;

  constructor(
    private homeServ: HomeService,
    private memberServ: MemberService,
    private store$: Store<NgxStoreModule>,
    private batchActionsServ: BatchActionsService,
    private message: NzMessageService,
    private storageCache: StorageCacheService
  ) {}

  ngOnInit(): void {
    this.initUserData()
  }

  initUserData(): void {
    this.wyRememberLogin = this.storageCache.get('wyRememberLogin');
    const userId = this.storageCache.get('wyUserId')
    if (userId) {
      this.store$.dispatch(SetUserId({ id: userId }))
      this.memberServ.getUserDetail(userId).subscribe((user) => (this.user = user))
    }
  }

  //#region 弹框逻辑
  onChangeModalType(modalType = ModalTypes.Default) {
    this.store$.dispatch(SetModalType({ modalType }))
  }

  openModal(type: ModalTypes) {
    this.batchActionsServ.controlModal(true, type)
  }

  closeModal() {
    this.batchActionsServ.controlModal(false)
  }
  //#endregion

  onLogin(params: LoginParams) {
    this.memberServ.login(params).subscribe(
      (user) => {
        this.closeModal()
        this.message.success('登录成功')
        this.user = user
        this.store$.dispatch(SetUserId({ id: String(user.profile.userId) }))

        this.storageCache.set('wyUserId', user.profile.userId)
        if (params.remember) {
          this.storageCache.set('wyRememberLogin', codeJson(params))
        } else {
          this.storageCache.remove('wyRememberLogin')
        }
      },
      (error) => {
        this.message.error(error.message || '登录失败')
      }
    )
  }

  onLogout() {
    this.memberServ.logout().subscribe(
      () => {
        this.message.success('已退出')
        this.user = null
        this.store$.dispatch(SetUserId({ id: '' }))
        this.storageCache.remove('wyUserId')
      },
      (error) => {
        this.message.error(error.message || '退出失败')
      }
    )
  }

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
