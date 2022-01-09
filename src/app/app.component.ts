import { HttpErrorResponse } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { select, Store } from '@ngrx/store'
import { SearchResult, Singer, Song, SongSheet } from '@shared/interfaces/common'
import { ICreateSheet, LikeSongParams, LoginParams, ShareParams, User } from '@shared/interfaces/member'
import { isEmptyObject } from '@shared/untils'
import { SetModalType, SetModalVisible, SetUserId } from '@store/actions/member.actions'
import { BatchActionsService } from '@store/batch-actions.service'
import { ModalTypes, ShareInfo } from '@store/reducers/member.reducer'
import { getLikeId, getMember, getModalType, getModalVisible, getShareInfo } from '@store/selectors/member.selectors'
import { NzMessageService } from 'ng-zorro-antd/message'
import { iif, interval, Observable, of } from 'rxjs'
import { filter, finalize, map, mergeMap, takeUntil } from 'rxjs/operators'
import { HomeService } from './services/home.service'
import { MemberService } from './services/member.service'
import { StorageCacheService } from './services/storage-cache.service'
import { codeJson } from './shared/untils/base64'
import { NgxStoreModule } from './store'
@UntilDestroy()
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
  wyRememberLogin?: LoginParams
  userSheets: SongSheet[] = []
  // 当前要收藏歌曲的id
  likeId: string = ''
  // 弹窗类型
  modalType = ModalTypes.Default
  // 弹窗显示
  modalVisible = false
  // 弹窗loading
  loading = false
  // 当前要分享歌曲的信息
  shareInfo!: ShareInfo
  // 页面标题
  pageTitle = ''
  // 页面加载百分比
  loadPercent = 0
  // 导航开始事件
  private navStart$ = <Observable<NavigationStart>>this.router.events.pipe(filter((e) => e instanceof NavigationStart))
  // 导航结束事件
  private navEnd$ = <Observable<NavigationEnd>>this.router.events.pipe(filter((e) => e instanceof NavigationEnd))

  constructor(
    private homeServ: HomeService,
    private memberServ: MemberService,
    private store$: Store<NgxStoreModule>,
    private batchActionsServ: BatchActionsService,
    private message: NzMessageService,
    private storageCache: StorageCacheService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private titleServ: Title
  ) {}

  ngOnInit(): void {
    this.initUserData()
    this.initSubscribe()
    this.listenRouterEvent()
    this.setLoadingBar()
  }

  listenRouterEvent(): void {
    this.navStart$.subscribe(() => {
      this.loadPercent = 0
    })
    this.navEnd$
      .pipe(
        map(() => this.activateRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild
          return route
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        this.loadPercent = 100
        if (this.pageTitle !== data.title) {
          this.pageTitle = data.title
          this.titleServ.setTitle(this.pageTitle)
        }
      })
  }

  setLoadingBar(): void {
    interval(100)
      .pipe(takeUntil(this.navEnd$))
      .subscribe(() => {
        this.loadPercent = Math.max(95, ++this.loadPercent)
      })
  }

  initUserData(): void {
    this.wyRememberLogin = this.storageCache.get('wyRememberLogin')
    const userId = this.storageCache.get('wyUserId')
    if (userId) {
      this.store$.dispatch(SetUserId({ id: userId }))
      this.memberServ.getUserDetail(userId).subscribe((user) => (this.user = user))
    }
  }

  initSubscribe(): void {
    const appStore$ = this.store$.pipe(select(getMember))
    appStore$.pipe(select(getLikeId), untilDestroyed(this)).subscribe((id) => (this.likeId = id))
    appStore$.pipe(select(getModalVisible), untilDestroyed(this)).subscribe((visib) => this.watchModalVisible(visib))
    appStore$.pipe(select(getModalType), untilDestroyed(this)).subscribe((type) => this.watchModalType(type))
    appStore$.pipe(select(getShareInfo), untilDestroyed(this)).subscribe((info) => this.watchShareInfo(info))
  }

  //#region 监听 Store Data
  watchModalVisible(visibe: boolean) {
    if (this.modalVisible !== visibe) {
      this.modalVisible = visibe
    }
  }

  watchModalType(type: ModalTypes) {
    if (this.modalType !== type) {
      this.modalType = type
      if (type === ModalTypes.Like) {
        this.getUserSheets()
      }
    }
  }

  watchShareInfo(info: ShareInfo | undefined) {
    if (info) {
      if (this.user) {
        this.shareInfo = info
        this.openModal(ModalTypes.Share)
      } else {
        // 未登录则打开登录弹框
        this.openModal(ModalTypes.Default)
      }
    }
  }
  //#endregion

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

  // 获取当前用户的歌单
  getUserSheets() {
    if (this.user) {
      this.memberServ.getUserSheets(String(this.user.profile.userId)).subscribe((userSheet) => {
        this.userSheets = userSheet.self
        this.store$.dispatch(SetModalVisible({ modalVisible: true }))
      })
    } else {
      // 未登录则打开登录弹框
      this.openModal(ModalTypes.Default)
    }
  }

  // 收藏歌曲
  onLikeSong(args: LikeSongParams) {
    this.memberServ.likeSong(args).subscribe(
      () => {
        this.closeModal()
        this.message.success('收藏成功')
      },
      (error) => {
        this.message.error(error.msg || '收藏失败')
      }
    )
  }

  // 新建歌单
  onCreateSheet({ sheetName }: ICreateSheet) {
    this.memberServ.createSheet(sheetName).subscribe(
      (pid) => {
        this.onLikeSong({ pid, tracks: this.likeId })
      },
      (error) => {
        this.message.error(error.msg || '新建失败')
      }
    )
  }

  // 分享
  onShare(info: ShareParams) {
    this.memberServ.shareResource(info).subscribe(
      () => {
        this.closeModal()
        this.message.success('分享成功')
      },
      (error) => {
        this.message.error(error.msg || '分享失败')
      }
    )
  }

  // TODO: 注册
  onRegister(phone: string) {
    this.message.success(phone + '注册成功')
  }

  // 登录
  onLogin(params: LoginParams) {
    this.loading = true
    this.memberServ
      .login(params)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
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

  // 登出
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

  // 搜索歌曲
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
