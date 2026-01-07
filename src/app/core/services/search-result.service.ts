import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { finalize, Observable, tap } from 'rxjs';

export interface SearchResult {
  company_id: number;
  company_name?: string | null;
  link: string;
  link_key: string;
  source_scraping?: string | number | null;
  title?: string | null;
  redirect_link?: string | null;
  displayed_link?: string | null;
  source?: string | null;
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
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface SearchResultPayload {
  title: string | null;
  redirectLink: string | null;
  displayedLink: string | null;
  source: string | null;
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
}

@Injectable({
  providedIn: 'root'
})
export class SearchResultService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/search-results`;
  private readonly resultsSignal = signal<SearchResult[]>([]);
  private readonly loadingSignal = signal(false);

  readonly results = this.resultsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadAll(filters?: { sourceScraping?: string | number | null }): Observable<ApiResponse<SearchResult[]>> {
    this.loadingSignal.set(true);
    let params = new HttpParams();
    const sourceScraping = filters?.sourceScraping;
    if (sourceScraping !== undefined && sourceScraping !== null && sourceScraping !== '') {
      params = params.set('sourceScraping', String(sourceScraping));
    }

    return this.http.get<ApiResponse<SearchResult[]>>(this.baseUrl, { params }).pipe(
      tap((res) => this.resultsSignal.set(res.data)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  update(companyId: number, linkKey: string, payload: SearchResultPayload): Observable<ApiResponse<SearchResult>> {
    return this.http
      .put<ApiResponse<SearchResult>>(`${this.baseUrl}/${companyId}/${linkKey}`, payload)
      .pipe(
        tap((res) =>
          this.resultsSignal.set(
            this.resultsSignal().map((item) =>
              item.company_id === companyId && item.link_key === linkKey ? res.data : item
            )
          )
        )
      );
  }

  remove(companyId: number, linkKey: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${companyId}/${linkKey}`).pipe(
      tap(() =>
        this.resultsSignal.set(
          this.resultsSignal().filter(
            (item) => !(item.company_id === companyId && item.link_key === linkKey)
          )
        )
      )
    );
  }
}
