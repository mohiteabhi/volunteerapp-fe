import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  apiError = '';
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    const params = this.route.snapshot.queryParams;
    if (params['returnUrl']) {
      this.returnUrl = params['returnUrl'];
    }
  }

  onSubmit(): void {
    this.apiError = '';
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: errMsg => {
        this.apiError = errMsg;
      }
    });
  }

  goBack(): void {
    // Navigate back or to home page
    this.router.navigate(['/']);
  }
}
