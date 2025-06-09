import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityEventsComponent } from './city-events.component';

describe('CityEventsComponent', () => {
  let component: CityEventsComponent;
  let fixture: ComponentFixture<CityEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CityEventsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
