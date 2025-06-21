import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsOrganizedComponent } from './events-organized.component';

describe('EventsOrganizedComponent', () => {
  let component: EventsOrganizedComponent;
  let fixture: ComponentFixture<EventsOrganizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventsOrganizedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsOrganizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
