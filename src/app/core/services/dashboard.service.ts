import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap, finalize } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface DashboardSummary {
  companies: number;
  leads: number;
  searchResults: number;
  latestLeadUpdate: string;
  latestSearchUpdate: string;
}

export interface DashboardLead {
  id_lead: string;
  nombre?: string | null;
  cargo?: string | null;
  updated_at?: string | null;
  company_name?: string | null;
}

export interface DashboardCompany {
  id: number;
  company_name: string;
  search_results: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentLeads: DashboardLead[];
  topCompanies: DashboardCompany[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/dashboard`;
  private readonly dataSignal = signal<DashboardData | null>(null);
  private readonly loadingSignal = signal(false);

  readonly data = this.dataSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  load(): Observable<ApiResponse<DashboardData>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<DashboardData>>(this.baseUrl).pipe(
      tap((res) => this.dataSignal.set(res.data)),
      finalize(() => this.loadingSignal.set(false))
    );
  }
}
