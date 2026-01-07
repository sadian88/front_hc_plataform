import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SearchResultFormComponent } from './search-result-form/search-result-form.component';
import {
  SearchResult,
  SearchResultPayload,
  SearchResultService
} from '../../core/services/search-result.service';

@Component({
  selector: 'app-search-result-editor-page',
  standalone: true,
  imports: [CommonModule, SearchResultFormComponent],
  templateUrl: './search-result-editor.page.html',
  styleUrl: './search-result-editor.page.scss'
})
export class SearchResultEditorPageComponent implements OnInit {
  private readonly searchResultService = inject(SearchResultService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly statusMessage = signal('Completa la informacion del Company_Prospecto.');
  readonly companyId = signal<number | null>(null);
  readonly linkKey = signal<string | null>(null);
  readonly result = signal<SearchResult | null>(null);
  readonly submitLabel = computed(() => 'Actualizar');

  ngOnInit(): void {
    const companyIdParam = this.route.snapshot.paramMap.get('companyId');
    const linkKeyParam = this.route.snapshot.paramMap.get('linkKey');
    if (!companyIdParam || !linkKeyParam) {
      this.statusMessage.set('Parametros invalidos para editar.');
      return;
    }

    const parsedCompanyId = Number(companyIdParam);
    if (Number.isNaN(parsedCompanyId)) {
      this.statusMessage.set('ID de compania invalido.');
      return;
    }

    this.companyId.set(parsedCompanyId);
    this.linkKey.set(linkKeyParam);
    this.loadResult(parsedCompanyId, linkKeyParam);
  }

  handleSave(payload: SearchResultPayload): void {
    const companyId = this.companyId();
    const linkKey = this.linkKey();
    if (companyId === null || !linkKey) {
      this.statusMessage.set('No se pudo guardar el resultado.');
      return;
    }

    this.loading.set(true);
    this.statusMessage.set('Guardando informacion...');

    this.searchResultService
      .update(companyId, linkKey, payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.statusMessage.set('Resultado actualizado.');
          this.goBack();
        },
        error: () => this.statusMessage.set('No se pudo actualizar el resultado.')
      });
  }

  goBack(): void {
    const companyId = this.companyId();
    this.router.navigate(['/app/company-prospectos'], {
      queryParams: { sourceScraping: companyId ?? null }
    });
  }

  private loadResult(companyId: number, linkKey: string): void {
    this.loading.set(true);
    this.searchResultService
      .loadAll({ sourceScraping: companyId })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          const found =
            this.searchResultService
              .results()
              .find((item) => item.company_id === companyId && item.link_key === linkKey) || null;
          if (!found) {
            this.statusMessage.set('No se encontro el resultado solicitado.');
          }
          this.result.set(found);
        },
        error: () => this.statusMessage.set('No fue posible cargar el resultado.')
      });
  }
}
