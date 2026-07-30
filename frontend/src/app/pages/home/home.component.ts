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

  private readonly step = 190;

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

  get progressPercent(): number {
    const max = this.maxIndex;
    return max === 0 ? 100 : (this.currentIndex / max) * 100;
  }

  get counterDisplay(): string {
    return String(this.currentIndex + 1).padStart(2, '0');
  }

  get totalDisplay(): string {
    return String(this.totalSlides).padStart(2, '0');
  }

  prev(): void {
    if (this.currentIndex <= 0) return;
    this.currentIndex--;
    this.applyOffset();
    this.resetAutoAdvance();
  }

  next(): void {
    if (this.currentIndex >= this.maxIndex) return;
    this.currentIndex++;
    this.applyOffset();
    this.resetAutoAdvance();
  }

  private applyOffset(): void {
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
      this.applyOffset();
    }, 3000);
  }

  private stopAutoAdvance(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  resetAutoAdvance(): void {
    this.stopAutoAdvance();
    this.startAutoAdvance();
  }

  pauseAutoAdvance(): void { this.stopAutoAdvance(); }
  resumeAutoAdvance(): void { this.startAutoAdvance(); }

  // drag
  private dragging = false;
  private startX = 0;
  private startTransform = 0;

  onPointerDown(e: PointerEvent): void {
    this.dragging = true;
    this.startX = e.clientX;
    const el = this.trackRef?.nativeElement;
    if (el) {
      const m = new DOMMatrix(window.getComputedStyle(el).transform);
      this.startTransform = m.m41;
      el.classList.add('dragging');
      try { (el as any).setPointerCapture(e.pointerId); } catch {}
    }
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.dragging) return;
    const el = this.trackRef?.nativeElement;
    if (el) {
      el.style.transform = `translateX(${this.startTransform + (e.clientX - this.startX)}px)`;
    }
  }

  onPointerUp(_e: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;
    const el = this.trackRef?.nativeElement;
    if (el) el.classList.remove('dragging');
    const dx = _e.clientX - this.startX;
    if (dx < -40) this.currentIndex++;
    else if (dx > 40) this.currentIndex--;
    this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.maxIndex));
    this.applyOffset();
    this.resetAutoAdvance();
  }

  onPointerCancel(): void {
    if (!this.dragging) return;
    this.dragging = false;
    const el = this.trackRef?.nativeElement;
    if (el) el.classList.remove('dragging');
    this.applyOffset();
  }
}
