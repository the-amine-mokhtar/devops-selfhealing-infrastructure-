import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Engagement } from '../../core/models/engagement.model';
import { TrackerApiService } from '../../core/services/tracker-api.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';
  engagementCount = 0;
  userCount = 0;
  activeCount = 0;
  completedCount = 0;
  partners: Engagement[] = [];
  carouselIndex = 0;
  private carouselTimer: ReturnType<typeof setInterval> | null = null;
  readonly auth = inject(AuthService);

  constructor(private readonly trackerApi: TrackerApiService) {}

  ngOnInit(): void {
    this.trackerApi.getUsers().subscribe({
      next: (users) => {
        this.userCount = users.length;
      }
    });

    this.trackerApi.getEngagements().subscribe({
      next: (engagements) => {
        this.engagementCount = engagements.length;
        this.activeCount = engagements.filter((e) => e.status === 'ACTIVE').length;
        this.completedCount = engagements.filter((e) => e.status === 'COMPLETED').length;
        this.partners = engagements.slice(0, 8);
        this.loading = false;
        this.startCarousel();
      },
      error: () => {
        this.error = 'Backend not reachable yet. Start Spring Boot to load live tracker data.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  private startCarousel(): void {
    this.carouselTimer = setInterval(() => {
      this.carouselIndex = (this.carouselIndex + 1) % Math.max(this.partners.length, 1);
    }, 2500);
  }

  private stopCarousel(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = null;
    }
  }

  pauseCarousel(): void {
    this.stopCarousel();
  }

  resumeCarousel(): void {
    this.startCarousel();
  }
}
