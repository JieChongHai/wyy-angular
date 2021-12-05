import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCardComponent implements OnInit {
  @Output() openModal = new EventEmitter<void>()
  constructor() {}

  ngOnInit(): void {}
}
