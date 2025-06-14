import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { Router } from '@angular/router';
import { CreateEventRequest } from '../models/event.model';
import { AuthService } from 'src/app/components/volunteering/services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-organize-event',
  templateUrl: './organize-event.component.html',
  styleUrls: ['./organize-event.component.scss'],
})
export class OrganizeEventComponent {
  eventForm: FormGroup;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;
  userId: any;
  isUserLoaded = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.eventForm = this.createForm();
  }

    ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.eventForm.patchValue({
          organizerName: user.fullName,
          contact: user.contactNo
        });
        this.isUserLoaded = true;
      },
      error: (error) => {
        console.error('Failed to load user data', error);
        this.isUserLoaded = true; // Still allow form submission
      }
    });
  
  }

  private createForm(): FormGroup {
    return this.fb.group({
      cityName: ['', [Validators.required, Validators.minLength(2)]],
      eventDes: ['', [Validators.required, Validators.minLength(10)]],
      totalVol: [
        '',
        [Validators.required, Validators.min(1), Validators.max(1000)],
      ],
      eventDate: ['', [Validators.required, this.futureDateValidator]],
      eventTime: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      organizerName: ['', [Validators.required, Validators.minLength(2)]],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
  }

  futureDateValidator(control: any) {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    return selectedDate >= today ? null : { pastDate: true };
  }

  onSubmit(): void {
    if (this.eventForm.valid && this.isSubmitting) {
      Object.keys(this.eventForm.controls).forEach((key) =>
        this.eventForm.get(key)?.markAsTouched()
      );
      return;
    }
    this.isSubmitting = true;
    this.submitError = '';

    const formValue = this.eventForm.value;
    const cityName = (formValue.cityName || '').trim();
    const eventDes = (formValue.eventDes || '').trim();
    const totalVol =
      formValue.totalVol !== null && formValue.totalVol !== undefined
        ? parseInt(formValue.totalVol, 10)
        : 0; // or some default
    const address = (formValue.address || '').trim();
    const organizerName = (formValue.organizerName || '').trim();
    const contact = (formValue.contact || '').trim();
    const eventDate = formValue.eventDate; // e.g. "2025-06-10"
    const eventTime = formValue.eventTime ? formValue.eventTime + ':00' : '';
    const userId = this.userId;

    // Create the request payload
    const createEventRequest: CreateEventRequest = {
      userId,
      cityName,
      eventDes,
      totalVol,
      noOfVolJoined: 0,
      eventDate,
      eventTime,
      address,
      organizerName,
      contact,
    };
    console.log('Creating event with payload:', createEventRequest);

    this.eventService.createEvent(createEventRequest).subscribe({
      next: (response) => {
        console.log('Event created successfully:', response);
        this.submitSuccess = true;
        this.isSubmitting = false;

        // Show success message for 2 seconds then navigate
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.submitError = error || 'Failed to create event. Please try again.';
        this.isSubmitting = false;
      },
    });
    // } else {
    //   // Mark all fields as touched to show validation errors
    //   Object.keys(this.eventForm.controls).forEach(key => {
    //     this.eventForm.get(key)?.markAsTouched();
    //   });
    // }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required'])
        return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength'])
        return `${this.getFieldLabel(fieldName)} is too short`;
      if (field.errors['min'])
        return `${this.getFieldLabel(fieldName)} must be at least 1`;
      if (field.errors['max'])
        return `${this.getFieldLabel(fieldName)} cannot exceed 1000`;
      if (field.errors['pattern'])
        return 'Please enter a valid 10-digit phone number';
      if (field.errors['pastDate']) return 'Event date cannot be in the past';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      city_name: 'City name',
      eventDes: 'Event description',
      totalVol: 'Total volunteers',
      eventDate: 'Event date',
      eventTime: 'Event time',
      address: 'Address',
      organizerName: 'Organizer name',
      contact: 'Contact number',
    };
    return labels[fieldName] || fieldName;
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }
}
