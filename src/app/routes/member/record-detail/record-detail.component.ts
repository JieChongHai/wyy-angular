import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { RecordType, RecordVal, User } from '@shared/interfaces/member'
import { NgxStoreModule } from '@store/index'
import { BatchActionsService } from '@store/batch-actions.service'
import { NzMessageService } from 'ng-zorro-antd/message'
import { MemberService } from 'src/app/services/member.service'
import { SheetService } from 'src/app/services/sheet.service'
import { SongService } from 'src/app/services/song.service'
import { map, pluck, switchMap } from 'rxjs/operators'
import { Song } from '@shared/interfaces/common'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { getCurrentSong, getPlayer } from '@store/selectors/player.selectors'

@UntilDestroy()
@Component({
  templateUrl: './record-detail.component.html',
  styleUrls: ['./record-detail.component.less']
})
export class RecordDetailComponent implements OnInit {
  user!: User
  records: RecordVal[] = []
  recordType = RecordType.weekData
  currentSong?: Song
  currentIndex = -1

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sheetServ: SheetService,
    private songServ: SongService,
    private batchActionsServ: BatchActionsService,
    private memberServ: MemberService,
    private store$: Store<NgxStoreModule>,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(
        map((res) => res.data),
        untilDestroyed(this)
      )
      .subscribe(([user, userRecord]) => {
        this.user = user
        this.records = userRecord
        this.handleCurrentSong()
      })
  }

  handleCurrentSong() {
    this.store$.pipe(select(getPlayer), select(getCurrentSong), untilDestroyed(this)).subscribe((song) => {
      const songs = this.records.map(item => item.song);
      this.currentSong = song
      this.currentIndex = song ? songs.findIndex((item) => item.id === song.id) : -1
    })
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

  onChangeType(type: RecordType) {
    if (this.recordType !== type) {
      this.recordType = type
      this.memberServ.getUserRecord(this.user.profile.userId.toString(), type).subscribe((records) => {
        this.records = records.slice(0, 10)
      })
    }
  }

  // 添加一首歌曲
  onAddSong([song, isPlay = false]: [song: Song, isPlay: boolean]) {
    if (!this.currentSong || this.currentSong.id !== song.id) {
      // 获取带有播放地址的歌曲信息
      this.songServ.getSongList(song).subscribe((list) => {
        if (list[0] && list[0].url) {
          this.batchActionsServ.insertSong(list[0], isPlay)
        } else {
          this.message.warning('当前歌曲无版权!')
        }
      })
    }
  }

  // 收藏歌曲
  onLikeSong(id: string) {
    this.batchActionsServ.likeSong(id)
  }

  // 分享歌曲
  onShareSong(song: Song) {
    this.batchActionsServ.shareResource(song)
  }

}
