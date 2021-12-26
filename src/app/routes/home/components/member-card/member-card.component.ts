import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core'
import { User } from '@shared/interfaces/member'

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCardComponent implements OnInit {
  point = 0
  tipTitle = ''
  showTip = false
  @Input() user?: User
  @Output() openModal = new EventEmitter<void>()
  constructor() {}

  ngOnInit(): void {}

  onSignin(): void {}
}
