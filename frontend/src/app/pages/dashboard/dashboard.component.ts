import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Engagement, EngagementStatus } from '../../core/models/engagement.model';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { TrackerApiService } from '../../core/services/tracker-api.service';
import { saveAs } from 'file-saver';

type ViewMode = 'engagements' | 'users';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  readonly statuses: EngagementStatus[] = ['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED'];
  readonly roleOptions = ['Partner', 'Manager', 'Consultant', 'Analyst'];
  readonly today = new Date().toISOString().slice(0, 10);
  readonly pageSize = 5;
  readonly auth = inject(AuthService);

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  viewMode: ViewMode = 'engagements';
  loading = false;
  saving = false;
  exporting = false;
  error = '';
  search = '';
  statusFilter: EngagementStatus | '' = '';
  selectedEngagementId: number | null = null;
  selectedUserId: number | null = null;

  engagements: Engagement[] = [];
  users: User[] = [];
  selectedUserForEngagements: User | null = null;

  engagementPage = 1;
  userPage = 1;

  private readonly fb = inject(FormBuilder);

  engagementForm = this.fb.group({
    clientName: ['', [Validators.required, Validators.maxLength(160)]],
    status: ['ACTIVE' as EngagementStatus, Validators.required],
    consultantId: [0, [Validators.required, Validators.min(1)]],
    startDate: ['', Validators.required],
    value: [0, [Validators.required, Validators.min(0)]],
    deadline: ['', Validators.required]
  });

  userForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['Consultant', Validators.required],
    password: ['']
  });

  constructor(private readonly api: TrackerApiService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';

    this.api.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.userPage = 1;
        this.refreshEngagements();
      },
      error: () => {
        this.error = 'Could not load data. Check that the backend is running on port 8080.';
        this.loading = false;
      }
    });
  }

  refreshEngagements(): void {
    this.api.getEngagements(this.search || undefined, this.statusFilter || undefined).subscribe({
      next: (engagements) => {
        this.engagements = engagements;
        this.engagementPage = 1;
        this.loading = false;
        if (!this.engagementForm.value.consultantId && this.users.length) {
          this.engagementForm.patchValue({ consultantId: this.users[0].id ?? 0 });
        }
      },
      error: () => {
        this.error = 'Could not load engagements from the backend.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.selectedUserForEngagements = null;
    this.engagementPage = 1;
    this.refreshEngagements();
  }

  viewUserEngagements(user: User): void {
    this.selectedUserForEngagements = user;
    this.viewMode = 'engagements';
    this.search = '';
    this.statusFilter = '';
    this.selectedEngagementId = null;
    this.resetEngagementForm();
  }

  clearUserFilter(): void {
    this.selectedUserForEngagements = null;
    this.refreshEngagements();
  }

  get filteredEngagements(): Engagement[] {
    if (!this.selectedUserForEngagements?.id) return this.engagements;
    return this.engagements.filter(e => e.consultant.id === this.selectedUserForEngagements!.id);
  }

  resetEngagementForm(): void {
    this.selectedEngagementId = null;
    this.engagementForm.reset({
      clientName: '',
      status: 'ACTIVE',
      consultantId: this.users[0]?.id ?? 0,
      startDate: '',
      value: 0,
      deadline: ''
    });
  }

  editEngagement(item: Engagement): void {
    this.selectedEngagementId = item.id ?? null;
    this.engagementForm.patchValue({
      clientName: item.clientName,
      status: item.status,
      consultantId: item.consultant.id ?? 0,
      startDate: item.startDate,
      value: item.value,
      deadline: item.deadline
    });
  }

  saveEngagement(): void {
    if (this.engagementForm.invalid) {
      this.engagementForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = this.engagementForm.getRawValue();

    const request$ = this.selectedEngagementId
      ? this.api.updateEngagement(this.selectedEngagementId, payload as any)
      : this.api.createEngagement(payload as any);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.resetEngagementForm();
        this.refreshEngagements();
      },
      error: () => {
        this.error = 'Failed to save engagement.';
      }
    });
  }

  deleteEngagement(id: number): void {
    this.api.deleteEngagement(id).subscribe({
      next: () => this.refreshEngagements(),
      error: () => (this.error = 'Failed to delete engagement.')
    });
  }

  resetUserForm(): void {
    this.selectedUserId = null;
    this.userForm.reset({
      fullName: '',
      email: '',
      role: 'Consultant',
      password: ''
    });
  }

  editUser(item: User): void {
    this.selectedUserId = item.id ?? null;
    this.userForm.patchValue({
      fullName: item.fullName,
      email: item.email,
      role: item.role,
      password: ''
    });
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const raw = this.userForm.getRawValue();
    const payload: any = {
      fullName: raw.fullName,
      email: raw.email,
      role: raw.role
    };
    if (raw.password) payload.password = raw.password;

    const request$ = this.selectedUserId
      ? this.api.updateUser(this.selectedUserId, payload)
      : this.api.createUser(payload);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.resetUserForm();
        this.loadAll();
      },
      error: () => {
        this.error = 'Failed to save user.';
      }
    });
  }

  deleteUser(id: number): void {
    this.api.deleteUser(id).subscribe({
      next: () => this.loadAll(),
      error: () => (this.error = 'Failed to delete user.')
    });
  }

  exportEngagementsPdf(): void {
    this.exporting = true;
    this.api.exportEngagementsPdf(this.search || undefined, this.statusFilter || undefined).pipe(
      finalize(() => (this.exporting = false))
    ).subscribe({
      next: (blob) => saveAs(blob, 'engagements.pdf'),
      error: () => (this.error = 'Failed to export PDF.')
    });
  }

  exportUsersPdf(): void {
    this.exporting = true;
    this.api.exportUsersPdf().pipe(
      finalize(() => (this.exporting = false))
    ).subscribe({
      next: (blob) => saveAs(blob, 'consultants.pdf'),
      error: () => (this.error = 'Failed to export PDF.')
    });
  }

  get activeEngagements(): number {
    return this.engagements.filter((engagement) => engagement.status === 'ACTIVE').length;
  }

  get completedEngagements(): number {
    return this.engagements.filter((engagement) => engagement.status === 'COMPLETED').length;
  }

  get paginatedEngagements(): Engagement[] {
    const start = (this.engagementPage - 1) * this.pageSize;
    return this.filteredEngagements.slice(start, start + this.pageSize);
  }

  get paginatedUsers(): User[] {
    const start = (this.userPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  get totalEngagementPages(): number {
    return Math.ceil(this.filteredEngagements.length / this.pageSize) || 1;
  }

  get totalUserPages(): number {
    return Math.ceil(this.users.length / this.pageSize) || 1;
  }

  engagementPageNumbers(): number[] {
    return Array.from({ length: this.totalEngagementPages }, (_, i) => i + 1);
  }

  userPageNumbers(): number[] {
    return Array.from({ length: this.totalUserPages }, (_, i) => i + 1);
  }

  goToEngagementPage(page: number): void {
    if (page >= 1 && page <= this.totalEngagementPages) {
      this.engagementPage = page;
    }
  }

  goToUserPage(page: number): void {
    if (page >= 1 && page <= this.totalUserPages) {
      this.userPage = page;
    }
  }
}