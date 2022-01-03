import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { NgxStoreModule } from '@store/index'
import { BatchActionsService } from '@store/batch-actions.service'
import { NzMessageService } from 'ng-zorro-antd/message'
import { SongService } from 'src/app/services/song.service'
import { map } from 'rxjs/operators'
import { Singer, SingerDetail, Song, SongSheet } from '@shared/interfaces/common'
import { getCurrentSong, getPlayer } from '@store/selectors/player.selectors'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'

@UntilDestroy()
@Component({
  selector: 'app-singer-detail',
  templateUrl: './singer-detail.component.html',
  styleUrls: ['./singer-detail.component.less'],
})
export class SingerDetailComponent implements OnInit {
  singerDetail!: SingerDetail
  simiSingers!: Singer[]
  currentSong?: Song
  currentIndex = -1
  // TODO: 找到所有的 *ngFor 看看是否需要trackBy（数组被全量更新的时候）
  trackByFn = (index: number, singer: Singer) => singer.id

  constructor(
    private route: ActivatedRoute,
    private store$: Store<NgxStoreModule>,
    private songServ: SongService,
    private messageServ: NzMessageService,
    private batchActionServ: BatchActionsService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(
        map((res) => res.singerDetail),
        untilDestroyed(this)
      )
      .subscribe(([singerDetail, simiSingers]) => {
        this.singerDetail = singerDetail
        this.simiSingers = simiSingers
        this.handleCurrentSong()
      })
  }

  private handleCurrentSong() {
    this.store$.pipe(select(getPlayer), select(getCurrentSong), untilDestroyed(this)).subscribe((song) => {
      this.currentSong = song
      this.currentIndex = song ? this.singerDetail.hotSongs.findIndex((item) => item.id === song.id) : -1
    })
  }

  //#region 按钮操作

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

  // 批量收藏
  onLikeSongs(songs: Song[]) {
    const ids = songs.map((item) => item.id).join(',')
    this.onLikeSong(ids)
  }

  // 收藏歌曲
  onLikeSong(id: string) {
    this.batchActionServ.likeSong(id)
  }

  // 分享
  onShareSong(song: Song) {
    this.batchActionServ.shareResource(song)
  }
  //#endregion
}
