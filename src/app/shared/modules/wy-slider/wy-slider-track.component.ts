import { Component, ChangeDetectionStrategy, OnChanges, Input } from '@angular/core'
import { NgChanges } from '@shared/interfaces/utils'
import { WySliderStyle } from './wy-slider-helper'

@Component({
  selector: 'app-wy-slider-track',
  template: ` <div class="wy-slider-track" [class.buffer]="buffer" [ngStyle]="style"></div> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WySliderTrackComponent implements OnChanges {
  /** 是否垂直放置 */
  @Input() vertical = false
  /** 播放进度 */
  @Input() length: number = 0
  /** 缓冲进度 */
  @Input() buffer: boolean = false
  // 进度条样式
  style: WySliderStyle = {}
  constructor() {}

  ngOnChanges(changes: NgChanges<WySliderTrackComponent>): void {
    if (changes.length) {
      let style = {}
      if (this.vertical) {
        style = {
          height: `${this.length}%`,
        }
        // this.style.left = null;
        // this.style.width = null;
      } else {
        style = {
          width: `${this.length}%`,
        }
        // this.style.bottom = null;
        // this.style.height = null;
      }
      this.style = style
    }
  }
}
