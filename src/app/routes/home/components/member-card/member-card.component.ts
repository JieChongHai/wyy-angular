import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
  ChangeDetectorRef,
} from '@angular/core'
import { User } from '@shared/interfaces/member'
import { NzMessageService } from 'ng-zorro-antd/message'
import { timer } from 'rxjs'
import { MemberService } from 'src/app/services/member.service'

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCardComponent implements OnInit {
  point = 0
  tipTitle = ''
  visible = false
  @Input() user?: User
  @Output() openModal = new EventEmitter<void>()
  constructor(private memberServ: MemberService, private message: NzMessageService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  onSignin(): void {
    this.memberServ.signin().subscribe(
      ({ point }) => {
        this.message.success('签到成功')
        this.tipTitle = `积分+${point}`
        this.visible = true
        this.cdr.markForCheck()
        timer(1500).subscribe(() => {
          this.visible = false
          this.tipTitle = ''
          this.cdr.markForCheck()
        })
      },
      (error) => {
        this.message.error(error.msg || '签到失败')
      }
    )
  }
}
