import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-card">
      <div class="login-head">
        <span class="brand-mark"></span>
        <h1>Create account</h1>
        <p>Register to access engagements</p>
      </div>
      <div class="login-body">
        <div class="login-error" *ngIf="error">{{ error }}</div>
        <div class="login-error" *ngIf="form.get('fullName')?.invalid && form.get('fullName')?.touched">Name is required.</div>
        <div class="login-error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">Valid email is required.</div>
        <div class="login-error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">Password must be at least 8 characters.</div>
        <form [formGroup]="form" (ngSubmit)="register()">
          <label>
            Full name
            <input formControlName="fullName" type="text" placeholder="Jane Doe" />
          </label>
          <label>
            Email
            <input formControlName="email" type="email" placeholder="jane@firm.com" autocomplete="email" />
          </label>
          <label>
            Password
            <input formControlName="password" type="password" placeholder="Min 8 characters" autocomplete="new-password" />
          </label>
          <button type="submit" [disabled]="loading">{{ loading ? 'Creating…' : 'Create account' }}</button>
        </form>
      </div>
      <div class="login-foot">
        <a routerLink="/login">Already have an account? Sign in</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; min-height: calc(100vh - 4.6rem); align-items: center; justify-content: center; background: linear-gradient(135deg, #1d1d20 0%, #0f0f11 100%); }
    .login-card { width: 100%; max-width: 400px; margin: 2rem; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .login-head { padding: 2rem 2rem 1.5rem; text-align: center; }
    .login-head .brand-mark { display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg,#ffd100 0 72%,transparent 72% 100%); transform: skewX(-18deg); margin-bottom: 0.75rem; }
    .login-head h1 { margin: 0; font-size: 1.3rem; color: #1d1d1b; }
    .login-head p { margin: 0.3rem 0 0; color: #8a867c; font-size: 0.9rem; }
    .login-body { padding: 0 2rem 2rem; }
    .login-body label { display: grid; gap: 0.3rem; margin-bottom: 1rem; color: #4b4740; font-weight: 600; font-size: 0.9rem; }
    .login-body input { width: 100%; }
    .login-body button { width: 100%; min-height: 3rem; background: #212127; color: #fff; font-weight: 700; font-size: 1rem; border: 0; cursor: pointer; margin-top: 0.5rem; }
    .login-body button:disabled { opacity: 0.5; }
    .login-error { padding: 0.75rem; margin-bottom: 1rem; background: rgba(182,70,70,0.1); color: #b64646; font-weight: 600; font-size: 0.85rem; text-align: center; border-radius: 6px; }
    .login-foot { padding: 1rem 2rem; border-top: 1px solid rgba(18,18,18,0.08); text-align: center; }
    .login-foot a { color: #6f6a60; font-size: 0.85rem; text-decoration: none; font-weight: 600; }
    .login-foot a:hover { color: #1d1d1b; }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  error = '';
  loading = false;

  form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  register(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.http.post<any>('/api/auth/register', this.form.getRawValue()).subscribe({
      next: (res) => {
        localStorage.setItem('ey_token', res.token);
        localStorage.setItem('ey_user', JSON.stringify({ email: res.email, fullName: res.fullName, role: res.role }));
        localStorage.setItem('ey_session_expiry', String(Date.now() + 30 * 60 * 1000));
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.error = err.error?.message || err.error || 'Registration failed.';
        this.loading = false;
      }
    });
  }
}