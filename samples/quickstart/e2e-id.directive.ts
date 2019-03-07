import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { IdCollector } from '@redmedical/hvstr-client';
import { environment } from './environments/environment'; // Adapt environment here

@Directive({
  selector: '[e2e]'
})
export class E2eIdDirective implements OnInit, OnDestroy {
  @Input('e2e')
  e2eId: string;
  
  constructor(private el: ElementRef) {}
  
  ngOnInit(): void {
    if (!environment.production) {
      IdCollector.add(this.el.nativeElement, this.e2eId);
    }
  }

  ngOnDestroy(): void {
    if (!environment.production) {
      IdCollector.remove(this.e2eId);
    }
  }
}
