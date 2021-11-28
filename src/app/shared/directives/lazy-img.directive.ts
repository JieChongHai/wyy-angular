import { Directive, ElementRef, Renderer2 } from '@angular/core'

@Directive({
  selector: 'img',
})
export class LazyImgDirective {
  constructor(private renderer: Renderer2, private element: ElementRef<HTMLImageElement>) {
    const supports = 'loading' in HTMLImageElement.prototype

    if (supports) {
      this.renderer.setAttribute(this.element.nativeElement, 'loading', 'lazy')
    }
  }
}
