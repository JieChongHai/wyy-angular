import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { SongSheet } from '@shared/interfaces/common';

@Component({
  selector: 'app-single-sheet',
  templateUrl: './single-sheet.component.html',
  styleUrls: ['./single-sheet.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleSheetComponent {
  @Input() sheet!: SongSheet;
  @Output() play = new EventEmitter<number>();

  constructor() {}

  playSheet(id: number) {
    this.play.emit(id);
  }
}
