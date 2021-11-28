/**
 * 参考 https://netbasal.com/implementing-event-modifiers-in-angular-87e1a07969ce
 */
import { Directive, ElementRef, EventEmitter, Output, Renderer2 } from '@angular/core'

@Directive({
  selector: '[click.stop]',
})
export class StopPropagationDirective {
  @Output('click.stop') stopPropEvent = new EventEmitter()
  private unsubscribe!: () => void

  constructor(private renderer: Renderer2, private element: ElementRef) {}

  ngOnInit() {
    this.unsubscribe = this.renderer.listen(this.element.nativeElement, 'click', (event) => {
      event.stopPropagation()
      this.stopPropEvent.emit(event)
    })
  }

  ngOnDestroy() {
    this.unsubscribe()
  }
}
