import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, finalize, tap } from 'rxjs';

export interface Prospect {
  id: string;
  id_externo: string;
  nombre_completo?: string | null;
  email?: string | null;
  perfil_linkedin?: string | null;
  cargo?: string | null;
  about?: string | null;
  location?: string | null;
  estado?: string | null;
  fecha_creacion_origen?: string | null;
  company_id?: number | null;
  company_origen_lead?: string | null;
  created_at?: string;
  updated_at?: string;
  company_name?: string | null;
  origen_company_name?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ProspectPayload {
  nombreCompleto: string;
  email: string | null;
  perfilLinkedin: string | null;
  cargo: string | null;
  about: string | null;
  location: string | null;
  estado: string | null;
  fechaCreacionOrigen: string | null;
  companyId: number | null;
  companyOrigenLead: string | null;
}

export interface ProspectFilters {
  sourceScraping?: string | number | null;
  estado?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProspectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/prospects`;
  private readonly prospectsSignal = signal<Prospect[]>([]);
  private readonly loadingSignal = signal(false);

  readonly prospects = this.prospectsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadAll(filters?: ProspectFilters): Observable<ApiResponse<Prospect[]>> {
    this.loadingSignal.set(true);

    let params = new HttpParams();
    const sourceScraping = filters?.sourceScraping;
    if (sourceScraping !== undefined && sourceScraping !== null && sourceScraping !== '') {
      params = params.set('sourceScraping', String(sourceScraping));
    }

    const estado = filters?.estado;
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<ApiResponse<Prospect[]>>(this.baseUrl, { params }).pipe(
      tap((res) => this.prospectsSignal.set(res.data)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  update(id: string, payload: ProspectPayload): Observable<ApiResponse<Prospect>> {
    return this.http.put<ApiResponse<Prospect>>(`${this.baseUrl}/${id}`, payload).pipe(
      tap((res) =>
        this.prospectsSignal.set(
          this.prospectsSignal().map((prospect) => (prospect.id === id ? res.data : prospect))
        )
      )
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() =>
        this.prospectsSignal.set(
          this.prospectsSignal().filter((prospect) => prospect.id !== id)
        )
      )
    );
  }
}
