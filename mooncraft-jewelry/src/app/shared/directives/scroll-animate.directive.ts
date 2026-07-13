import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() appScrollAnimate: 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'slide-in-up' | 'scale-in' = 'fade-in';
  @Input() delay: number = 0;

  private intersectionObserver?: IntersectionObserver;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add delay if specified
          if (this.delay > 0) {
            setTimeout(() => {
              this.renderer.addClass(entry.target, this.appScrollAnimate);
              this.renderer.addClass(entry.target, 'animate-on-scroll');
            }, this.delay);
          } else {
            this.renderer.addClass(entry.target, this.appScrollAnimate);
            this.renderer.addClass(entry.target, 'animate-on-scroll');
          }
          // Stop observing after animation
          this.intersectionObserver?.unobserve(entry.target);
        }
      });
    }, options);

    this.intersectionObserver.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}
