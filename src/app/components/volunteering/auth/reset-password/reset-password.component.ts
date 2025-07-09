import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl 
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  // form: FormGroup;
  // token: string;
  // message = '';

  // constructor(
  //   private fb: FormBuilder,
  //   private route: ActivatedRoute,
  //   private auth: AuthService,
  //   private router: Router
  // ) {
  //   this.form = this.fb.group({
  //     newPassword: ['', [Validators.required, Validators.minLength(6)]],
  //   });
  //   this.token = this.route.snapshot.queryParams['token'] || '';
  // }

  // ngOnInit() {
  //   if (!this.token) {
  //     this.message = 'Invalid reset link.';
  //   }
  // }

  // onSubmit() {
  //   if (!this.form.valid) return;
  //   this.auth
  //     .resetPassword({
  //       token: this.token,
  //       newPassword: this.form.value.newPassword,
  //     })
  //     .subscribe({
  //       next: () => {
  //         this.message = 'Password updated. Redirecting to login...';
  //         setTimeout(() => this.router.navigate(['/login']), 3000);
  //       },
  //       error: (err) => (this.message = err),
  //     });
  // }

    form: FormGroup;
  token: string = '';
  isLoading = false;
  isValidatingToken = true;
  isTokenValid = false;
  isPasswordReset = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  countdown = 5;
  private countdownSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    this.validateToken();
  }

  ngOnDestroy() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  validateToken() {
    if (!this.token) {
      this.isValidatingToken = false;
      this.isTokenValid = false;
      return;
    }

    // Simulate token validation - replace with actual API call
    setTimeout(() => {
      this.isValidatingToken = false;
      this.isTokenValid = true; // Set to false if token is invalid
      
      // If token is invalid, you can set:
      // this.isTokenValid = false;
    }, 1500);
  }

  onSubmit() {
    if (!this.form.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const resetData = {
      token: this.token,
      newPassword: this.form.get('newPassword')?.value
    };

    this.auth.resetPassword(resetData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isPasswordReset = true;
        this.startCountdown();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'An error occurred while resetting your password. Please try again.';
        console.error('Reset password error:', error);
      }
    });
  }

  private startCountdown() {
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.goToLogin();
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  // Password strength validator
  private passwordStrengthValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (hasUpperCase && hasLowerCase && hasNumber) {
      return null; // Valid
    }

    return { pattern: true };
  }

  // Password match validator
  private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  // Get password strength class
  getPasswordStrength(): string {
    const password = this.form.get('newPassword')?.value || '';
    if (!password) return '';

    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score < 3) return 'weak';
    if (score < 5) return 'fair';
    if (score < 6) return 'good';
    return 'strong';
  }

  // Get password strength text
  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Weak password';
      case 'fair': return 'Fair password';
      case 'good': return 'Good password';
      case 'strong': return 'Strong password';
      default: return '';
    }
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
