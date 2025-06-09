import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-volunteering',
  templateUrl: './volunteering.component.html',
  styleUrls: ['./volunteering.component.scss'],
})
export class VolunteeringComponent {
    constructor(private elementRef: ElementRef, private router: Router) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  getStarted(): void {
    alert('Welcome to SwayamSevak! Let\'s get you started with volunteering.');
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  private initializeAnimations(): void {
    // Add hover effects to navigation links
    const navLinks = this.elementRef.nativeElement.querySelectorAll('.nav-link');
    navLinks.forEach((link: HTMLElement) => {
      link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-1px)';
      });
      link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });
  }
}
