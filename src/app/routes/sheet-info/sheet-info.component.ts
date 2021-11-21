import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { NgxStoreModule } from '@store/index'
import { BatchActionsService } from '@store/batch-actions.service'
import { SongService } from 'src/app/services/song.service'
import { map, takeUntil } from 'rxjs/operators'
import { Song, SongSheet } from '@shared/interfaces/common'
import { Subject } from 'rxjs'
import { getCurrentSong, getPlayer } from '@store/selectors/player.selectors'
import { NzMessageService } from 'ng-zorro-antd/message'

@Component({
  templateUrl: './sheet-info.component.html',
  styleUrls: ['./sheet-info.component.less'],
})
export class SheetInfoComponent implements OnInit, OnDestroy {
  sheetInfo!: SongSheet
  currentSong?: Song
  currentIndex = -1

  description = {
    short: '',
    long: '',
  }

  controlDesc = {
    isExpand: false,
    label: '展开',
    iconCls: 'down',
  }

  private destroy$ = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    private store$: Store<NgxStoreModule>,
    private songServ: SongService,
    private messageServ: NzMessageService,
    private batchActionServ: BatchActionsService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  ngOnInit(): void {
    this.route.data
      .pipe(
        map((res) => res.sheetInfo),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        this.sheetInfo = res
        if (res.description) {
          this.changeDesc(res.description)
        }
        this.handleCurrentSong()
      })
  }

  // 重新生成长短评语
  private changeDesc(desc: string) {
    const isShort = desc.length < 99
    this.description = {
      short: isShort
        ? this.replaceBr('<b>介绍：</b>' + desc)
        : this.replaceBr('<b>介绍：</b>' + desc.slice(0, 99)) + '...',
      long: isShort ? '' : this.replaceBr('<b>介绍：</b>' + desc),
    }
  }

  // 替换换行符
  private replaceBr(str: string): string {
    return str.replace(/\n/g, '<br />')
  }

  private handleCurrentSong() {
    this.store$.pipe(select(getPlayer), select(getCurrentSong), takeUntil(this.destroy$)).subscribe((song) => {
      this.currentSong = song
      this.currentIndex = song ? this.sheetInfo.tracks.findIndex((item) => item.id === song.id) : -1
    })
  }

  //#region 按钮操作
  
  // 展开/收起评语
  toggleDesc() {
    const isExpand = !this.controlDesc.isExpand
    this.controlDesc = {
      isExpand,
      label: isExpand ? '收起' : '展开',
      iconCls: isExpand ? 'up' : 'down',
    }
  }

  // 添加一首歌曲
  onAddSong(song: Song, isPlay = false) {
    if (!this.currentSong || this.currentSong.id !== song.id) {
      // 获取带有播放地址的歌曲信息
      this.songServ.getSongList(song).subscribe((list) => {
        if (list[0] && list[0].url) {
          this.batchActionServ.insertSong(list[0], isPlay)
        } else {
          this.messageServ.create('warning', '当前歌曲无版权！')
        }
      })
    }
  }

  // 添加多首歌曲
  onAddSongs(songs: Song[], isPlay = false) {
    this.songServ.getSongList(songs).subscribe((list) => {
      if (list.length) {
        if (isPlay) {
          this.batchActionServ.playSheet(list, 0)
        } else {
          this.batchActionServ.insertSongs(list)
        }
      }
    })
  }

  // 收藏歌单
  onLikeSheet(id: string) {}

  // 收藏歌曲
  onLikeSong(id: string) {}

  // 分享
  shareResource(resource: Song | SongSheet, type = 'song') {}
  //#endregion
}
