import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  form: FormGroup;
  token: string;
  message = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  ngOnInit() {
    if (!this.token) {
      this.message = 'Invalid reset link.';
    }
  }

  onSubmit() {
    if (!this.form.valid) return;
    this.auth
      .resetPassword({
        token: this.token,
        newPassword: this.form.value.newPassword,
      })
      .subscribe({
        next: () => {
          this.message = 'Password updated. Redirecting to login...';
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => (this.message = err),
      });
  }
}
