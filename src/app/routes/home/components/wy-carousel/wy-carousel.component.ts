import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

export type ArrowType = 'pre' | 'next'

@Component({
  selector: 'app-wy-carousel',
  templateUrl: './wy-carousel.component.html',
  styleUrls: ['./wy-carousel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyCarouselComponent {
  @Input() activeIndex = 0;
  @Output() changeSlide = new EventEmitter<ArrowType>();

  constructor() {}

  onChangeSlide(type: ArrowType) {
    this.changeSlide.emit(type);
  }
}
