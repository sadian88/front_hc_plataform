import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { finalize, Observable, tap } from 'rxjs';
import { AuthStateService } from '../state/auth-state.service';

export interface Lead {
  id_lead: string;
  company_id?: number | null;
  company_name?: string | null;
  nombre?: string | null;
  cargo?: string | null;
  seniority?: string | null;
  rol_funcional?: string | null;
  empresa?: string | null;
  sector_empresa?: string | null;
  pais?: string | null;
  ciudad?: string | null;
  tamano_empresa_empleados?: number | null;
  headline_perfil?: string | null;
  resumen_perfil?: string | null;
  temas_clave_publicaciones?: string[] | null;
  ultimas_publicaciones_texto?: string[] | null;
  interacciones_relevantes?: string[] | null;
  tags_internos?: string[] | null;
  created_at?: string;
  updated_at?: string;
  linkedin_url?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface LeadPayload {
  companyId: number | null;
  nombre: string;
  cargo: string | null;
  seniority: string | null;
  rolFuncional: string | null;
  empresa: string | null;
  sectorEmpresa: string | null;
  pais: string | null;
  ciudad: string | null;
  tamanoEmpresaEmpleados: number | null;
  headlinePerfil: string | null;
  resumenPerfil: string | null;
  temasClavePublicaciones: string[];
  ultimasPublicacionesTexto: string[];
  interaccionesRelevantes: string[];
  tagsInternos: string[];
  linkedinUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);
  private readonly baseUrl = `${environment.apiBaseUrl}/leads`;
  private readonly leadsSignal = signal<Lead[]>([]);
  private readonly loadingSignal = signal(false);

  readonly leads = this.leadsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadAll(): Observable<ApiResponse<Lead[]>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Lead[]>>(this.baseUrl, { headers: this.buildAuthHeaders() }).pipe(
      tap((res) => this.leadsSignal.set(res.data)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  update(id: string, payload: LeadPayload): Observable<ApiResponse<Lead>> {
    return this.http
      .put<ApiResponse<Lead>>(`${this.baseUrl}/${id}`, payload, { headers: this.buildAuthHeaders() })
      .pipe(
        tap((res) =>
          this.leadsSignal.set(
            this.leadsSignal().map((lead) => (lead.id_lead === id ? res.data : lead))
          )
        )
      );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.buildAuthHeaders() }).pipe(
      tap(() => this.leadsSignal.set(this.leadsSignal().filter((lead) => lead.id_lead !== id)))
    );
  }

  private buildAuthHeaders(): HttpHeaders | undefined {
    const token = this.authState.session()?.sessionToken;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }
}
