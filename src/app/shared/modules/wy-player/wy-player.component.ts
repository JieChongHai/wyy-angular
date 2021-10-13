import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyPlayerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
