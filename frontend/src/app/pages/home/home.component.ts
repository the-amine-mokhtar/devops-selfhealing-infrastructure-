import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Engagement } from '../../core/models/engagement.model';
import { TrackerApiService } from '../../core/services/tracker-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  loading = true;
  error = '';
  engagementCount = 0;
  userCount = 0;
  activeCount = 0;
  completedCount = 0;
  partners: Engagement[] = [];

  constructor(private readonly trackerApi: TrackerApiService) {}

  ngOnInit(): void {
    this.trackerApi.getUsers().subscribe({
      next: (users) => { this.userCount = users.length; }
    });
    this.trackerApi.getEngagements().subscribe({
      next: (engagements) => {
        this.engagementCount = engagements.length;
        this.activeCount = engagements.filter(e => e.status === 'ACTIVE').length;
        this.completedCount = engagements.filter(e => e.status === 'COMPLETED').length;
        this.partners = engagements.filter(e => e.logo).slice(0, 8);
        this.loading = false;
      },
      error: () => {
        this.error = 'Backend not reachable yet. Start Spring Boot to load live tracker data.';
        this.loading = false;
      }
    });
  }
}