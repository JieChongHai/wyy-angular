import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { WySliderStyle } from './wy-slider-helper';

@Component({
  selector: 'app-wy-slider-handle',
  template: ` <div class="wy-slider-handle" [ngStyle]="style"></div> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WySliderHandleComponent implements OnChanges {
  /** 是否垂直放置 */
  @Input() vertical = false;
  /** 偏移量 */
  @Input() offset: number = 0;
  // 滑块样式
  style: WySliderStyle = {};

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.offset) {
      const direction = this.vertical ? 'bottom' : 'left';
      this.style = { [direction]: `${this.offset}%` };
    }
  }
}
