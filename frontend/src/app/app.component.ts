import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sub: Subscription;
  isAdminRoute = false;

  constructor() {
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.sub = this.auth.sessionExpired$.subscribe(expired => {
      if (expired) {
        this.auth.logout(true);
        this.router.navigate(['/login']);
      }
    });
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.isAdminRoute = this.router.url.startsWith('/admin');
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  get currentUser(): { email?: string; fullName?: string } | null {
    return this.auth.getUser();
  }
}