import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core'
import BScroll from '@better-scroll/core'
import ScrollBar from '@better-scroll/scroll-bar'
import MouseWheel from '@better-scroll/mouse-wheel'
import { timer } from 'rxjs'

BScroll.use(MouseWheel)
BScroll.use(ScrollBar)

@Component({
  selector: 'app-wy-scroll',
  template: `
    <div class="wy-scroll" #wrap>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .wy-scroll {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyScrollComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() data?: any[] // content 元素，即列表数据
  @Input() refreshDelay = 50 // 当前容器显示后延迟刷新的时间（ 重新计算 content 元素高度）
  @Output() private scrollEnd = new EventEmitter<number>() // 滚动结束事件
  @ViewChild('wrap', { static: true }) private wrapDom!: ElementRef

  private bs?: BScroll

  constructor(public el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { data } = changes
    if (data) {
      this.refreshScroll()
    }
  }

  ngAfterViewInit(): void {
    this.bs = new BScroll(this.wrapDom.nativeElement, {
      scrollbar: {
        interactive: true,
      },
      mouseWheel: {
        // speed: 10, // 鼠标滚轮滚动的速度
      },
    })
    // 监听一下滚动结束事件，把滚动的高度发射出去
    this.bs.on('scrollEnd', (position: { x: number; y: number }) => this.scrollEnd.emit(position.y))
  }

  ngOnDestroy(): void {
    this.bs?.destroy()
  }

  //#region 可以暴露给外部使用的方法
  /** 重新计算 BetterScroll */
  refreshScroll(cb?: Function) {
    timer(this.refreshDelay).subscribe(() => {
      this.bs?.refresh()
      cb && cb()
    })
  }

  /** 滚动到指定的目标元素 */
  scrollToElement(el: string | HTMLElement, time: number, offsetX: number | boolean, offsetY: number | boolean) {
    this.bs?.scrollToElement.apply(this.bs, [el, time, offsetX, offsetY])
  }

  /** 相对于当前位置偏移滚动 x,y 的距离 */
  scrollTo(...args: any[]) {
    this.bs?.scrollTo.apply(this.bs, <any>args)
  }
  //#endregion
}
