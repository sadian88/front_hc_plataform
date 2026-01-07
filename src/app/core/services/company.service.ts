import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap, finalize } from 'rxjs';

export interface Company {
  id: number;
  company_name: string;
  company_url_profile: string;
  company_segment?: string | null;
  customer_url_profile?: string | null;
  company_icp?: string | null;
  icp_industries?: string[] | null;
  icp_company_size?: string | null;
  icp_target_country?: string | null;
  icp_target_city?: string | null;
  icp_industry_pain?: string | null;
  icp_competitors?: string[] | null;
  icp_current_customers?: string[] | null;
  buyer_persona_name?: string | null;
  buyer_persona_age?: number | null;
  buyer_persona_role?: string | null;
  buyer_persona_company_type?: string | null;
  buyer_persona_location?: string | null;
  buyer_persona_goals?: string | null;
  buyer_persona_pain_points?: string | null;
  buyer_persona_buying_behavior?: string | null;
  buyer_persona_channels?: string[] | null;
  creation_date?: string | null;
  last_update?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface CompanyPayload {
  companyName: string;
  companyUrlProfile: string;
  companySegment?: string | null;
  customerUrlProfile?: string | null;
  companyIcp?: string | null;
  icpIndustries?: string[] | null;
  icpCompanySize?: string | null;
  icpTargetCountry?: string | null;
  icpTargetCity?: string | null;
  icpIndustryPain?: string | null;
  icpCompetitors?: string[] | null;
  icpCurrentCustomers?: string[] | null;
  buyerPersonaName?: string | null;
  buyerPersonaAge?: number | string | null;
  buyerPersonaRole?: string | null;
  buyerPersonaCompanyType?: string | null;
  buyerPersonaLocation?: string | null;
  buyerPersonaGoals?: string | null;
  buyerPersonaPainPoints?: string | null;
  buyerPersonaBuyingBehavior?: string | null;
  buyerPersonaChannels?: string[] | null;
  creationDate?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/companies`;
  private readonly companiesSignal = signal<Company[]>([]);
  private readonly loadingSignal = signal(false);

  readonly companies = this.companiesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadAll(): Observable<ApiResponse<Company[]>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Company[]>>(this.baseUrl).pipe(
      tap((res) => this.companiesSignal.set(res.data)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  create(payload: CompanyPayload): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(this.baseUrl, payload).pipe(
      tap((res) => this.companiesSignal.set([res.data, ...this.companiesSignal()]))
    );
  }

  update(id: number, payload: CompanyPayload): Observable<ApiResponse<Company>> {
    return this.http.put<ApiResponse<Company>>(`${this.baseUrl}/${id}`, payload).pipe(
      tap((res) =>
        this.companiesSignal.set(
          this.companiesSignal().map((company) => (company.id === id ? res.data : company))
        )
      )
    );
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() =>
        this.companiesSignal.set(this.companiesSignal().filter((company) => company.id !== id))
      )
    );
  }
}
