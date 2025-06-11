import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventJoinedComponent } from './event-joined.component';

describe('EventJoinedComponent', () => {
  let component: EventJoinedComponent;
  let fixture: ComponentFixture<EventJoinedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventJoinedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventJoinedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
