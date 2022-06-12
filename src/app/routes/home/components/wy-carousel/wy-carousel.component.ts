import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Banner } from '@shared/interfaces/common';

export type ArrowType = 'pre' | 'next'

@Component({
  selector: 'app-wy-carousel',
  templateUrl: './wy-carousel.component.html',
  styleUrls: ['./wy-carousel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyCarouselComponent {
  @Input() activeIndex:number = 0;
  @Input() banners: Banner[] = [];
  @Output() changeSlide = new EventEmitter<ArrowType>();

  get carouselStyles(): Record<string, string> {
    const { imageUrl } = this.banners[this.activeIndex];
    return {
      'background-image': `url(${imageUrl}?imageView&blur=40x20)`,
    }
  }

  onChangeSlide(type: ArrowType) {
    this.changeSlide.emit(type);
  }
}
