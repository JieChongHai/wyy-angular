import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { Song, SongSheet } from '@shared/interfaces/common'
import { NgxStoreModule } from '@store/index'
import { BatchActionsService } from '@store/batch-actions.service'
import { NzMessageService } from 'ng-zorro-antd/message'
import { Subject } from 'rxjs'
import { SongService } from 'src/app/services/song.service'
import { BaseLyricLine, WyLyric } from 'src/app/shared/modules/wy-player/wy-player-panel/wy-lyric'
import { map, takeUntil } from 'rxjs/operators'
import { getCurrentSong, getPlayer } from '@store/selectors/player.selectors'

@Component({
  selector: 'app-song-info',
  templateUrl: './song-info.component.html',
  styleUrls: ['./song-info.component.less'],
})
export class SongInfoComponent implements OnInit, OnDestroy {
  song!: Song
  currentSong?: Song
  lyric?: BaseLyricLine[]

  controlLyric = {
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
        map((res) => res.songInfo),
        takeUntil(this.destroy$)
      )
      .subscribe(([song, lyric]) => {
        this.song = song
        this.lyric = new WyLyric(lyric).lines
        console.log(this.lyric)
        this.handleCurrentSong()
      })
  }

  private handleCurrentSong() {
    this.store$.pipe(select(getPlayer), select(getCurrentSong), takeUntil(this.destroy$)).subscribe((song) => {
      this.currentSong = song
    })
  }

  //#region 按钮操作

  // 展开/收起歌词
  toggleLyric() {
    const isExpand = !this.controlLyric.isExpand
    this.controlLyric = {
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

  // 收藏歌单
  onLikeSheet(id: string) {}

  // 收藏歌曲
  onLikeSong(id: string) {}

  // 分享
  shareResource(resource: Song | SongSheet, type = 'song') {}
  //#endregion
}
