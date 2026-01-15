import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { finalize, Observable, tap } from 'rxjs';

export interface AnalisisLeadIcp {
  id: number;
  origen_lead_id?: number | null;
  company_name?: string | null;
  source_scraping?: string | number | null;
  nombre_empresa?: string | null;
  linkedin_url?: string | null;
  web_url?: string | null;
  headcount?: number | string | null;
  ubicacion_empresa?: string | null;
  descripcion_corta?: string | null;
  especialidades?: string[] | string | null;
  puntuacion_industria?: number | string | null;
  puntuacion_tamano?: number | string | null;
  puntuacion_ubicacion?: number | string | null;
  puntuacion_fit_digital?: number | string | null;
  score_total?: number | string | null;
  puntos_dolor_detectados?: string[] | string | null;
  analisis_final?: string | null;
  decision?: string | null;
  fecha_creacion?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AnalisisLeadsIcpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/analisis-leads-icp`;
  private readonly resultsSignal = signal<AnalisisLeadIcp[]>([]);
  private readonly loadingSignal = signal(false);

  readonly results = this.resultsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadAll(filters?: { sourceScraping?: string | number | null }): Observable<ApiResponse<AnalisisLeadIcp[]>> {
    this.loadingSignal.set(true);
    let params = new HttpParams();
    const sourceScraping = filters?.sourceScraping;
    if (sourceScraping !== undefined && sourceScraping !== null && sourceScraping !== '') {
      params = params.set('sourceScraping', String(sourceScraping));
    }

    return this.http.get<ApiResponse<AnalisisLeadIcp[]>>(this.baseUrl, { params }).pipe(
      tap((res) => this.resultsSignal.set(res.data)),
      finalize(() => this.loadingSignal.set(false))
    );
  }
}
