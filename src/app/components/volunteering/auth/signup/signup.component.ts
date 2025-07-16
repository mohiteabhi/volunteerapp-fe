import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SignupRequest } from '../../models/auth.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  apiError = '';
  currentQuoteIndex = 0;
  loading = false;

  skills: string[] = [];
  currentSkill: string = '';
  suggestedSkills: string[] = [
    'Teaching',
    'Healthcare',
    'Environmental',
    'Technology',
    'Communication',
    'Leadership',
    'Event Management',
    'Social Media',
    'Photography',
    'Writing',
    'Translation',
    'First Aid',
    'Fundraising',
    'Public Speaking',
    'Cooking',
    'Gardening',
    'Sports',
    'Music',
    'Art',
    'Construction',
  ];
  quotes = [
    'The best way to find yourself is to lose yourself in the service of others. - Mahatma Gandhi',
    'Volunteers do not necessarily have the time; they just have the heart. - Elizabeth Andrew',
    'How wonderful it is that nobody need wait a single moment before starting to improve the world. - Anne Frank',
    'The meaning of life is to find your gift. The purpose of life is to give it away. - Pablo Picasso',
    'We make a living by what we get, but we make a life by what we give. - Winston Churchill',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        age: [
          '',
          [Validators.required, Validators.min(16), Validators.max(100)],
        ],
        email: ['', [Validators.required, Validators.email]],
        address: ['', [Validators.required, Validators.minLength(5)]],
        cityName: ['', [Validators.required, Validators.minLength(3)]],
        contactNo: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        skills: [[]],
      },
      { validators: this.passwordMatchValidator }
    );

    // Rotate quotes every 5 seconds
    setInterval(() => {
      this.currentQuoteIndex =
        (this.currentQuoteIndex + 1) % this.quotes.length;
    }, 5000);
  }

  private passwordMatchValidator(form: FormGroup) {
    const pw = form.get('password')?.value;
    const cpw = form.get('confirmPassword')?.value;
    return pw === cpw ? null : { passwordMismatch: true };
  }

  addSkill(event: Event): void {
    event.preventDefault();
    const skillToAdd = this.currentSkill.trim();

    if (
      skillToAdd &&
      !this.skills.includes(skillToAdd) &&
      this.skills.length < 10
    ) {
      this.skills.push(skillToAdd);
      this.updateSkillsInForm();
      this.currentSkill = '';
      this.updateSuggestedSkills();
    }
  }

  addSuggestedSkill(skill: string): void {
    if (!this.skills.includes(skill) && this.skills.length < 10) {
      this.skills.push(skill);
      this.updateSkillsInForm();
      this.updateSuggestedSkills();
    }
  }

  removeSkill(index: number): void {
    this.skills.splice(index, 1);
    this.updateSkillsInForm();
    this.updateSuggestedSkills();
  }

  private updateSkillsInForm(): void {
    this.signupForm.patchValue({ skills: this.skills });
  }

  private updateSuggestedSkills(): void {
    this.suggestedSkills = this.suggestedSkills.filter(
      (skill) => !this.skills.includes(skill)
    );
  }

  onSubmit() {
    this.apiError = '';
    if (this.signupForm.invalid) {
      this.markAllTouched();
      return;
    }

    this.loading = true;

    const fv = this.signupForm.value;
    const payload: SignupRequest = {
      fullName: fv.name.trim(),
      age: parseInt(fv.age, 10),
      email: fv.email.trim(),
      address: fv.address.trim(),
      cityName: fv.cityName.trim(),
      contactNo: fv.contactNo.trim(),
      password: fv.password,
      skills: fv.skills.map((s: string) => s.trim()),
    };

    this.authService
      .signup(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (errMsg) => {
          this.apiError = errMsg;
        },
      });
  }

  private markAllTouched() {
    Object.values(this.signupForm.controls).forEach((ctrl) =>
      ctrl.markAsTouched()
    );
  }

  getFieldError(fn: string): string {
    const f = this.signupForm.get(fn);
    if (!f || !f.touched || !f.errors) return '';
    if (f.errors['required']) return `${this.label(fn)} is required`;
    if (f.errors['minlength']) return `${this.label(fn)} is too short`;
    if (fn === 'age' && (f.errors['min'] || f.errors['max']))
      return 'Age must be between 16 and 100';
    if (fn === 'email' && f.errors['email'])
      return 'Please enter a valid email address';
    if (f.errors['pattern'])
      return 'Please enter a valid 10-digit contact number';
    if (fn === 'confirmPassword' && f.errors['passwordMismatch'])
      return 'Passwords do not match';

    return '';
  }

  private label(fn: string): string {
    return (
      (
        {
          name: 'Full name',
          age: 'Age',
          email: 'Email',
          address: 'Address',
          cityName: 'City',
          contactNo: 'Contact number',
          password: 'Password',
          confirmPassword: 'Confirm password',
          skills: 'Skills',
        } as Record<string, string>
      )[fn] || fn
    );
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
