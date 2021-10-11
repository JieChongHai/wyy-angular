import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Singer } from 'src/app/shared/interfaces/common';

@Component({
  selector: 'app-singer-card',
  templateUrl: './singer-card.component.html',
  styleUrls: ['./singer-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingerCardComponent implements OnInit {
  @Input() singer!: Singer

  constructor() { }

  ngOnInit(): void {
  }

}
