import { DOCUMENT } from '@angular/common'
import { Directive, ElementRef, EventEmitter, Inject, Input, OnChanges, Output, Renderer2 } from '@angular/core'
import { NgChanges } from '@shared/interfaces/utils'

@Directive({
  selector: '[appClickoutside]',
})
export class ClickoutsideDirective implements OnChanges {
  @Input() bindFlag = false
  @Output() clickOutSide = new EventEmitter<void>()

  private handleClick?: () => void
  private containerDom: HTMLElement

  constructor(private el: ElementRef, @Inject(DOCUMENT) private doc: Document, private render: Renderer2) {
    this.containerDom = this.el.nativeElement as HTMLElement
  }

  ngOnChanges(changes: NgChanges<ClickoutsideDirective>): void {
    const { bindFlag } = changes
    if (bindFlag && !bindFlag.firstChange) {
      if (bindFlag.currentValue) {
        this.handleClick = this.render.listen(this.doc, 'click', (e) => {
          const flag = this.containerDom.contains(e.target)
          !flag && this.clickOutSide.emit()
        })
      } else {
        this.handleClick && this.handleClick()
      }
    }
  }
}
