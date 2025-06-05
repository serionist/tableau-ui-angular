import { Directive, ElementRef, HostListener, inject, input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[resizerFor]',
  standalone: false
})
export class ResizerDirective implements OnInit {


  readonly columnElement = input.required<HTMLElement>({
    alias: 'resizerFor'
  });
  private readonly resizerElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    console.log('resizer', this.columnElement());
  }

  private dragging: ResizerDraggingOptions | undefined;
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (this.dragging !== undefined) {
      return;
    }
    const element = this.columnElement();
    this.dragging = {
      columnElement: element,
      startWidth: +getComputedStyle(element).width.replace('px', ''),
      startX: event.clientX
    };
    this.renderer.addClass(this.resizerElement.nativeElement, 'dragging');
    
    event.preventDefault();
    event.stopPropagation();


    document.body.style.userSelect = 'none';
    const mouseMoveHandler = (e: MouseEvent) => {
      const x = e.clientX;
      if (!this.dragging) {
        return;
      }
      const change = e.clientX - this.dragging.startX;
      const newWidth = this.dragging.startWidth + change;

      this.dragging.columnElement.style.width = `${newWidth}px`;
      this.renderer.setStyle(element, 'flex-grow', 'unset');
      
    };
    document.addEventListener('mousemove', mouseMoveHandler);
    const mouseUpHandler = (e: MouseEvent) => {
      this.renderer.removeClass(this.resizerElement.nativeElement, 'dragging');
      this.dragging = undefined;

      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.body.style.userSelect = '';
    };

    document.addEventListener('mouseup', mouseUpHandler);
  }



}
interface ResizerDraggingOptions {
  columnElement: HTMLElement;
  startWidth: number;
  startX: number;
}
