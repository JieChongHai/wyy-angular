import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-wy-layer-default',
  templateUrl: './wy-layer-default.component.html',
  styleUrls: ['./wy-layer-default.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyLayerDefaultComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
