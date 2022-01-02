import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core'
import { Song } from '@shared/interfaces/common'
import { RecordType, RecordVal } from '@shared/interfaces/member'

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsComponent implements OnInit {
  RecordType = RecordType
  /** 听歌记录数据 */
  @Input() records: RecordVal[] = []
  /** 听歌记录查询时间范围(默认一周) */
  @Input() recordType = RecordType.weekData
  /** 累计听歌数量 */
  @Input() listenSongs = 0
  /** 当前正在播放的歌曲索引 */
  @Input() currentIndex = -1

  /** 切换时间范围 */
  @Output() changeType = new EventEmitter<RecordType>()
  /** 添加/播放歌曲到播放器(true 是播放 false 是添加) */
  @Output() addSong = new EventEmitter<[Song, boolean]>()
  /** 收藏歌曲 */
  @Output() likeSong = new EventEmitter<string>()
  /** 分享歌曲 */
  @Output() shareSong = new EventEmitter<Song>()

  trackByFn = (index: number, item: RecordVal) => item.song.id

  constructor() {}

  ngOnInit(): void {}
}
