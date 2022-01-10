import { BACKSPACE } from '@angular/cdk/keycodes'
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  forwardRef,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { fromEvent } from 'rxjs'

const CODELEN = 4

@UntilDestroy()
@Component({
  selector: 'app-wy-otp',
  templateUrl: './wy-otp.component.html',
  styleUrls: ['./wy-otp.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WyOtpComponent),
      multi: true,
    },
  ],
})
export class WyOtpComponent implements OnInit, ControlValueAccessor, AfterViewInit {
  inputArr = Array(CODELEN).fill('')
  inputsEl: HTMLInputElement[] = []
  private code: string = ''

  result: string[] = []
  currentFocusIndex = 0

  onTouched = () => {}
  onChange = (_: any) => {}

  @ViewChildren('input') inputsList!: QueryList<ElementRef>

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    console.log(this.inputsList)
    this.inputsEl = this.inputsList.map((item) => item.nativeElement)
    this.inputsEl[0].focus()
    for (let i = 0; i < this.inputsEl.length; i++) {
      const item = this.inputsEl[i]
      fromEvent(item, 'keyup')
        .pipe(untilDestroyed(this))
        .subscribe((event: any) => this.onKeyUp(event))
      fromEvent(item, 'click')
        .pipe(untilDestroyed(this))
        .subscribe(() => (this.currentFocusIndex = i))
    }
  }

  ngOnInit(): void {}

  private onKeyUp(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement
    const value = target.value
    const isBackSpace = event.keyCode === BACKSPACE

    if (/\D/.test(value)) {
      // 只能输入数字
      target.value = ''
      this.result[this.currentFocusIndex] = ''
    } else if (value) {
      // 处理循环输入
      this.result[this.currentFocusIndex] = value
      this.currentFocusIndex = ++this.currentFocusIndex % CODELEN
      this.inputsEl[this.currentFocusIndex].focus()
    } else if (isBackSpace) {
      // 如果是删除操作则向前退格，最多退到第一位
      this.result[this.currentFocusIndex] = ''
      this.currentFocusIndex = Math.max(--this.currentFocusIndex, 0)
      this.inputsEl[this.currentFocusIndex].focus()
      this.inputsEl[this.currentFocusIndex].select()
    }

    this.setValue(this.result.join(''))
  }

  private setValue(code: string) {
    this.code = code
    this.onChange(code)
    this.cdr.markForCheck()
  }

  writeValue(code: any): void {
    this.setValue(code)
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
}
