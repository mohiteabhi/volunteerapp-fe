import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  // form: FormGroup;
  // message = '';

  //   constructor(private fb: FormBuilder, private auth: AuthService) {
  //   this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  // }

  //   onSubmit() {
  //   if (!this.form.valid) return;
  //   this.auth.forgotPassword(this.form.value).subscribe({
  //     next: () => this.message = 'If you are a registered user, a password reset link has been sent to your email address.',
  //     error: err => this.message = 'If you are a registered user, a password reset link has been sent to your email address.'
  //   });
  // }

    form: FormGroup;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Clear any existing messages when component loads
    this.clearMessage();
  }

  onSubmit() {
    if (!this.form.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.clearMessage();

    const email = this.form.get('email')?.value;

    this.auth.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageType = 'success';
        this.message = 'If you are a registered user, a password reset link has been sent to your email address. Please check your inbox and follow the instructions.';
        
        // Optionally disable form after successful submission
        this.form.disable();
        
        // Auto redirect to login after some time (optional)
        // setTimeout(() => {
        //   this.router.navigate(['/login']);
        // }, 5000);
      },
      error: (error) => {
        this.isLoading = false;
        this.messageType = 'success'; // Keep it as success for security reasons
        this.message = 'If you are a registered user, a password reset link has been sent to your email address. Please check your inbox and follow the instructions.';
        
        // Log the actual error for debugging (remove in production)
        console.error('Forgot password error:', error);
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessage() {
    this.message = '';
    this.messageType = '';
  }

  // Helper method to check if field has error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.errors[errorType] && field.touched);
  }

  // Helper method to check if field is valid
  isFieldValid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.valid && field.touched);
  }
}
