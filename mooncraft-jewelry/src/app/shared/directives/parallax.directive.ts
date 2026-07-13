import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appParallax]',
  standalone: true
})
export class ParallaxDirective implements OnInit {
  @Input() appParallax: number | string = 0.5; // Parallax speed (0.5 = half speed)
  @Input() parallaxDirection: 'up' | 'down' = 'up';

  private parallaxSpeed: number = 0.5;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.parallaxSpeed = typeof this.appParallax === 'string'
      ? parseFloat(this.appParallax)
      : this.appParallax;

    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');
    this.renderer.setStyle(this.el.nativeElement, 'backface-visibility', 'hidden');
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'z-index', 'auto');
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollPos = window.scrollY;
    const elementPos = this.el.nativeElement.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    // Only apply parallax if element is in viewport
    if (elementPos < windowHeight && elementPos > -windowHeight) {
      const offset = scrollPos * this.parallaxSpeed;
      const direction = this.parallaxDirection === 'up' ? offset : -offset;

      this.renderer.setStyle(
        this.el.nativeElement,
        'transform',
        `translateY(${direction}px)`
      );
    }
  }
}
