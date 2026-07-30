import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Engagement } from '../../core/models/engagement.model';
import { TrackerApiService } from '../../core/services/tracker-api.service';

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
  currentIndex = 0;
  totalSlides = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  @ViewChild('carouselTrack') trackRef!: ElementRef<HTMLElement>;

  private readonly step = 176;
  private readonly padding = 120;

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
        this.partners = engagements.slice(0, 8);
        this.totalSlides = this.partners.length;
        this.loading = false;
        setTimeout(() => this.startAutoAdvance(), 300);
      },
      error: () => {
        this.error = 'Backend not reachable yet. Start Spring Boot to load live tracker data.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoAdvance();
  }

  get maxIndex(): number {
    const n = this.partners.length;
    if (n < 5) return 0;
    return n - 4;
  }

  get displayIndex(): string {
    return String(this.currentIndex + 1).padStart(2, '0');
  }

  get totalSlidesStr(): string {
    return String(this.totalSlides).padStart(2, '0');
  }

  get progressPercent(): number {
    const max = this.maxIndex;
    return max === 0 ? 100 : ((this.currentIndex) / max) * 100;
  }

  prev(): void {
    if (this.currentIndex <= 0) return;
    this.currentIndex--;
    this.updateTransform();
    this.resetAutoAdvance();
  }

  next(): void {
    if (this.currentIndex >= this.maxIndex) return;
    this.currentIndex++;
    this.updateTransform();
    this.resetAutoAdvance();
  }

  private updateTransform(): void {
    const el = this.trackRef?.nativeElement;
    if (el) {
      el.style.transform = `translateX(-${this.currentIndex * this.step}px)`;
    }
  }

  private startAutoAdvance(): void {
    this.stopAutoAdvance();
    this.timer = setInterval(() => {
      if (this.currentIndex >= this.maxIndex) {
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
      this.updateTransform();
    }, 4500);
  }

  private stopAutoAdvance(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  resetAutoAdvance(): void {
    this.stopAutoAdvance();
    this.startAutoAdvance();
  }

  onMouseEnter(): void { this.stopAutoAdvance(); }
  onMouseLeave(): void { this.startAutoAdvance(); }

  // drag
  private isDragging = false;
  private startX = 0;
  private startTransform = 0;
  private dragVelocity = 0;
  private lastX = 0;
  private lastTime = 0;

  onPointerDown(e: PointerEvent): void {
    this.isDragging = true;
    this.startX = e.clientX;
    this.lastX = e.clientX;
    this.lastTime = Date.now();
    const el = this.trackRef?.nativeElement;
    if (el) {
      const m = new DOMMatrix(window.getComputedStyle(el).transform);
      this.startTransform = m.m41;
      el.classList.add('dragging');
      try { (el as any).setPointerCapture(e.pointerId); } catch {}
    }
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;
    const now = Date.now();
    const dt = now - this.lastTime;
    if (dt > 0) this.dragVelocity = (e.clientX - this.lastX) / dt;
    this.lastX = e.clientX;
    this.lastTime = now;
    const el = this.trackRef?.nativeElement;
    if (el) {
      el.style.transform = `translateX(${this.startTransform + (e.clientX - this.startX)}px)`;
    }
  }

  onPointerUp(e: PointerEvent): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    const el = this.trackRef?.nativeElement;
    if (el) el.classList.remove('dragging');
    const delta = this.lastX - this.startX;
    if (Math.abs(delta) > 60 || Math.abs(this.dragVelocity) > 0.5) {
      if (delta < 0) this.currentIndex++;
      else this.currentIndex--;
    }
    this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.maxIndex));
    this.updateTransform();
    this.resetAutoAdvance();
  }

  onPointerCancel(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    const el = this.trackRef?.nativeElement;
    if (el) el.classList.remove('dragging');
    this.updateTransform();
  }
}
