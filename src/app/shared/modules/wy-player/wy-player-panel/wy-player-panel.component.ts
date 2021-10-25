import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core'
import { Song } from '@shared/interfaces/common'

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyPlayerPanelComponent implements OnInit {
  @Input() playing?: boolean
  @Input() show?: boolean
  @Input() songList?: Song[]
  @Input() currentSong?: Song
  @Input() currentIndex?: number

  @Output() closePanel = new EventEmitter<void>()
  @Output() changeSong = new EventEmitter<Song>()
  constructor() {}

  ngOnInit(): void {}
}
