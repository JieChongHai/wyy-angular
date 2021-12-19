import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { ModalTypes } from '@store/reducers/member.reducer';

@Component({
  selector: 'app-wy-layer-default',
  templateUrl: './wy-layer-default.component.html',
  styleUrls: ['./wy-layer-default.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyLayerDefaultComponent implements OnInit {
  ModalTypes = ModalTypes

  @Output() changeModalType = new EventEmitter<ModalTypes>();

  constructor() { }

  ngOnInit(): void {
  }

}
