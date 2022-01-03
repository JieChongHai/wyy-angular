import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { NgxStoreModule } from '@store/index'
import { BatchActionsService } from '@store/batch-actions.service'
import { SongService } from 'src/app/services/song.service'
import { map } from 'rxjs/operators'
import { Singer, Song, SongSheet } from '@shared/interfaces/common'
import { getCurrentSong, getPlayer } from '@store/selectors/player.selectors'
import { NzMessageService } from 'ng-zorro-antd/message'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { MemberService } from 'src/app/services/member.service'
import { ShareType } from '@shared/interfaces/member'
import { SetShareInfo } from '@store/actions/member.actions'

@UntilDestroy()
@Component({
  templateUrl: './sheet-info.component.html',
  styleUrls: ['./sheet-info.component.less'],
})
export class SheetInfoComponent implements OnInit {
  ShareType = ShareType
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

  constructor(
    private route: ActivatedRoute,
    private store$: Store<NgxStoreModule>,
    private songServ: SongService,
    private memberServ: MemberService,
    private message: NzMessageService,
    private batchActionServ: BatchActionsService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(
        map((res) => res.sheetInfo),
        untilDestroyed(this)
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
    this.store$.pipe(select(getPlayer), select(getCurrentSong), untilDestroyed(this)).subscribe((song) => {
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
          this.message.create('warning', '当前歌曲无版权！')
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
  onLikeSheet(id: string) {
    this.memberServ.likeSheet(id).subscribe(
      () => {
        this.message.success('收藏成功')
      },
      (error) => {
        this.message.error(error.msg || '收藏失败')
      }
    )
  }

  // 收藏歌曲
  onLikeSong(id: string) {
    this.batchActionServ.likeSong(id)
  }

  // 分享
  shareResource(resource: Song | SongSheet, type = ShareType.Song) {
    let txt = ''
    if (type === ShareType.Playlist) {
      txt = this.makeShareTxt('歌单', resource.name, (resource as SongSheet).creator.nickname)
    } else {
      txt = this.makeShareTxt('歌曲', resource.name, (resource as Song).ar)
    }
    this.store$.dispatch(SetShareInfo({ info: { id: String(resource.id), type, txt } }))
  }

  private makeShareTxt(type: string, name: string, makeBy: string | Singer[]): string {
    const makeByStr = Array.isArray(makeBy) ? makeBy.map((item) => item.name).join('/') : makeBy
    return `${type}: ${name} -- ${makeByStr}`
  }
  //#endregion
}
