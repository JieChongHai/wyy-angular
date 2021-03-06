import { DOCUMENT } from '@angular/common'
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  Input,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
  forwardRef,
  Output,
  EventEmitter,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { getPercent, limitNumberInRange } from '@shared/untils'
import { fromEvent, merge, Observable, Subscription } from 'rxjs'
import { distinctUntilChanged, filter, map, pluck, takeUntil, tap } from 'rxjs/operators'
import { getElementOffset, silentEvent, SliderEventObserverConfig } from './wy-slider-helper'

@Component({
  selector: 'app-wy-slider',
  templateUrl: './wy-slider.component.html',
  styleUrls: ['./wy-slider.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WySliderComponent),
      multi: true,
    },
  ],
})
export class WySliderComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /** 是否垂直放置 */
  @Input() vertical = false
  /** 移动的范围-最小值 */
  @Input() wyMin = 0
  /** 移动的范围-最大值 */
  @Input() wyMax = 100
  /** 缓冲进度百分比 */
  @Input() bufferOffset = 0

  @Output() afterDragEnd = new EventEmitter()

  @ViewChild('wySlider', { static: true }) wySlider!: ElementRef
  private sliderDom!: HTMLElement

  value = 0 // 组件双向绑定值
  offset = 0 // 与 value 相同，只供子组件使用
  isDragging = false // 是否处在拖动状态

  private dragStart$?: Observable<number>
  private dragMove$?: Observable<number>
  private dragEnd$?: Observable<Event>
  private dragStartSub?: Subscription | null
  private dragMoveSub?: Subscription | null
  private dragEndSub?: Subscription | null

  constructor(@Inject(DOCUMENT) private doc: Document, private cdr: ChangeDetectorRef) {}

  private onChanged(value: number): void {}
  private onTouched(): void {}

  writeValue(value: any): void {
    this.setValue(value, true)
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChanged = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  ngOnDestroy(): void {
    this.unsubscribeDrag()
  }

  ngOnInit(): void {
    this.sliderDom = this.wySlider.nativeElement
    this.createDraggingObservables()

    this.subscribeDrag(['start'])
  }

  // 创建各个事件流
  createDraggingObservables(): void {
    const data = this.getConfigData(this.vertical)
    data.forEach((source) => {
      const { start, move, end, filter: filterFunc = () => true, pluckKey } = source
      source.end$ = fromEvent(this.doc, end)
      source.startPlucked$ = fromEvent(this.sliderDom, start).pipe(
        filter(filterFunc),
        tap(silentEvent),
        pluck<Event, number>(...pluckKey),
        map((position: number) => this.findClosestValue(position))
      )
      source.moveResolved$ = fromEvent(this.doc, move).pipe(
        filter(filterFunc),
        tap(silentEvent),
        pluck<Event, number>(...pluckKey),
        distinctUntilChanged(),
        map((position: number) => this.findClosestValue(position)),
        distinctUntilChanged(),
        takeUntil(source.end$)
      )
    })

    this.dragStart$ = merge(...data.map((d) => d.startPlucked$!))
    this.dragMove$ = merge(...data.map((d) => d.moveResolved$!))
    this.dragEnd$ = merge(...data.map((d) => d.end$!))
  }

  // 获取配置对象
  getConfigData(vertical: Boolean): SliderEventObserverConfig[] {
    const orientField = vertical ? 'pageY' : 'pageX'
    const mouseData: SliderEventObserverConfig = {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup',
      pluckKey: [orientField],
    }
    const touchData: SliderEventObserverConfig = {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend',
      filter: (e: MouseEvent | TouchEvent) => e instanceof TouchEvent,
      pluckKey: ['touches', '0', orientField],
    }

    return [mouseData, touchData]
  }

  // 订阅各个事件
  subscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (events.includes('start') && this.dragStart$ && !this.dragStartSub) {
      this.dragStartSub = this.dragStart$.subscribe(this.onDragStart.bind(this))
    }
    if (events.includes('move') && this.dragMove$ && !this.dragMoveSub) {
      this.dragMoveSub = this.dragMove$.subscribe(this.onDragMove.bind(this))
    }
    if (events.includes('end') && this.dragEnd$ && !this.dragEndSub) {
      this.dragEndSub = this.dragEnd$.subscribe(this.onDragEnd.bind(this))
    }
  }

  // 退订各个事件
  unsubscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (events.includes('start') && this.dragStartSub) {
      this.dragStartSub.unsubscribe()
      this.dragStartSub = null
    }
    if (events.includes('move') && this.dragMoveSub) {
      this.dragMoveSub.unsubscribe()
      this.dragMoveSub = null
    }
    if (events.includes('end') && this.dragEndSub) {
      this.dragEndSub.unsubscribe()
      this.dragEndSub = null
    }
  }

  private toggleDragMoving(movable: boolean) {
    this.isDragging = movable
    if (movable) {
      this.subscribeDrag(['move', 'end'])
    } else {
      this.unsubscribeDrag(['move', 'end'])
    }
  }

  // 处理拖动开始事务
  private onDragStart(value: number) {
    this.toggleDragMoving(true)
    this.setValue(value)
  }

  // 处理拖动事务
  private onDragMove(value: number) {
    this.setValue(value)
  }

  // 处理拖动结束事务
  private onDragEnd() {
    this.toggleDragMoving(false)
    this.afterDragEnd.emit(this.value)
  }

  private findClosestValue(position: number): number {
    // 获取滑块总长
    const sliderLength = this.sliderDom[this.vertical ? 'clientHeight' : 'clientWidth']
    // 滑块(左, 上)端点位置
    const offset = getElementOffset(this.sliderDom)
    const sliderStart = this.vertical ? offset.top : offset.left

    // 滑块当前位置 / 滑块总长
    const ratio = limitNumberInRange((position - sliderStart) / sliderLength, 0, 1)
    return (this.vertical ? 1 - ratio : ratio) * (this.wyMax - this.wyMin) + this.wyMin
  }

  private setValue(value: number, needCheck = false) {
    if (needCheck) {
      if (this.isDragging) {
        return
      }
      this.value = this.formatValue(value)
      this.updateTrackAndHandles()
    } else if (!this.valuesEqual(this.value, value)) {
      this.value = value
      this.updateTrackAndHandles()
      this.onChanged(this.value)
    }
  }

  private updateTrackAndHandles() {
    this.offset = getPercent(this.wyMin, this.wyMax, this.value)
    this.cdr.markForCheck()
  }

  private formatValue(value: number): number {
    let res = value
    if (this.assertValueValid(value)) {
      res = this.wyMin
    } else {
      res = limitNumberInRange(value, this.wyMin, this.wyMax)
    }
    return res
  }

  // 判断是否是NAN
  private assertValueValid(value: number): boolean {
    return isNaN(typeof value !== 'number' ? parseFloat(value) : value)
  }

  private valuesEqual(valA: number | null, valB: number | null): boolean {
    if (typeof valA !== typeof valB) {
      return false
    }
    return valA === valB
  }
}
