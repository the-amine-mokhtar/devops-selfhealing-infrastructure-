import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Engagement } from '../../core/models/engagement.model';
import { TrackerApiService } from '../../core/services/tracker-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  loading = true;
  error = '';
  engagementCount = 0;
  userCount = 0;
  activeCount = 0;
  completedCount = 0;
  partners: Engagement[] = [];
  currentIndex = 0;
  totalSlides = 0;
  private autoAdvanceTimer: ReturnType<typeof setInterval> | null = null;
  private isDragging = false;
  private startX = 0;
  private startTransform = 0;
  private dragVelocity = 0;
  private lastX = 0;
  private lastTime = 0;
  cardWidth = 220;
  cardGap = 20;

  @ViewChild('carouselTrack') trackRef!: ElementRef<HTMLElement>;
  @ViewChild('carouselViewport') viewportRef!: ElementRef<HTMLElement>;

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
        this.totalSlides = this.partners.length;
        this.loading = false;
      },
      error: () => {
        this.error = 'Backend not reachable yet. Start Spring Boot to load live tracker data.';
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.startAutoAdvance(), 500);
  }

  ngOnDestroy(): void {
    this.stopAutoAdvance();
  }

  getStep(): number {
    return this.cardWidth + this.cardGap;
  }

  getMaxIndex(): number {
    if (!this.trackRef) return 0;
    const trackEl = this.trackRef.nativeElement;
    const viewportEl = this.viewportRef.nativeElement;
    const trackWidth = trackEl.scrollWidth;
    const visibleWidth = viewportEl.offsetWidth - 80;
    const maxScroll = Math.max(0, trackWidth - visibleWidth);
    const step = this.getStep();
    return step > 0 ? Math.ceil(maxScroll / step) : 0;
  }

  updateCarousel(): void {
    const maxIndex = this.getMaxIndex();
    if (this.currentIndex < 0) this.currentIndex = 0;
    if (this.currentIndex > maxIndex) this.currentIndex = maxIndex;

    const offset = -this.currentIndex * this.getStep();
    const track = this.trackRef?.nativeElement;
    if (track) {
      track.style.transform = `translateX(${offset}px)`;
    }
  }

  prev(): void {
    if (this.currentIndex <= 0) return;
    this.currentIndex--;
    this.updateCarousel();
    this.resetAutoAdvance();
  }

  next(): void {
    const maxIndex = this.getMaxIndex();
    if (this.currentIndex >= maxIndex) return;
    this.currentIndex++;
    this.updateCarousel();
    this.resetAutoAdvance();
  }

  private startAutoAdvance(): void {
    if (this.partners.length < 2) return;
    this.stopAutoAdvance();
    this.autoAdvanceTimer = setInterval(() => {
      const maxIndex = this.getMaxIndex();
      if (this.currentIndex >= maxIndex) {
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
      this.updateCarousel();
    }, 3500);
  }

  private stopAutoAdvance(): void {
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  resetAutoAdvance(): void {
    this.stopAutoAdvance();
    this.startAutoAdvance();
  }

  pauseAutoAdvance(): void {
    this.stopAutoAdvance();
  }

  resumeAutoAdvance(): void {
    this.startAutoAdvance();
  }

  onPointerDown(e: PointerEvent): void {
    if ((e.target as HTMLElement)?.closest('.carousel-btn')) return;
    this.isDragging = true;
    this.startX = e.clientX;
    this.lastX = e.clientX;
    this.lastTime = Date.now();
    const track = this.trackRef?.nativeElement;
    if (track) {
      const transform = window.getComputedStyle(track).transform;
      const matrix = new DOMMatrix(transform);
      this.startTransform = matrix.m41;
      track.classList.add('dragging');
      try { (track as any).setPointerCapture(e.pointerId); } catch {}
    }
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;
    const delta = e.clientX - this.startX;
    const now = Date.now();
    const dt = now - this.lastTime;
    if (dt > 0) {
      this.dragVelocity = (e.clientX - this.lastX) / dt;
    }
    this.lastX = e.clientX;
    this.lastTime = now;
    const track = this.trackRef?.nativeElement;
    if (track) {
      track.style.transform = `translateX(${this.startTransform + delta}px)`;
    }
  }

  onPointerUp(_e: PointerEvent): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    const track = this.trackRef?.nativeElement;
    if (track) track.classList.remove('dragging');
    const delta = this.lastX - this.startX;
    const threshold = 50;
    if (Math.abs(delta) > threshold || Math.abs(this.dragVelocity) > 0.5) {
      if (delta < 0) this.currentIndex++;
      else this.currentIndex--;
    }
    this.updateCarousel();
    this.resetAutoAdvance();
  }

  onPointerCancel(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    const track = this.trackRef?.nativeElement;
    if (track) track.classList.remove('dragging');
    this.updateCarousel();
  }

  onWheel(e: WheelEvent): void {
    if (Math.abs(e.deltaX) < 10) return;
    e.preventDefault();
    if (e.deltaX > 0) this.currentIndex++;
    else this.currentIndex--;
    this.updateCarousel();
    this.resetAutoAdvance();
  }

  get counterDisplay(): string {
    return String(this.currentIndex + 1).padStart(2, '0');
  }

  get totalDisplay(): string {
    return String(this.totalSlides).padStart(2, '0');
  }

  get progressPercent(): number {
    const maxIndex = this.getMaxIndex();
    return maxIndex === 0 ? 100 : ((this.currentIndex) / maxIndex) * 100;
  }

  cardOffset(i: number): string {
    return i % 2 === 0 ? 'card-offset-down' : 'card-offset-up';
  }

  trackStyle(): string {
    const offset = -this.currentIndex * this.getStep();
    return `transform: translateX(${offset}px)`;
  }
}
