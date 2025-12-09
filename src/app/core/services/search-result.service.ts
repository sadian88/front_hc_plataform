import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { finalize, Observable, tap } from 'rxjs';

export interface SearchResult {
  company_id: number;
  company_name?: string | null;
  link: string;
  link_key: string;
  title?: string | null;
  redirect_link?: string | null;
  displayed_link?: string | null;
  source?: string | null;
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

  loadAll(): Observable<ApiResponse<SearchResult[]>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<SearchResult[]>>(this.baseUrl).pipe(
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
