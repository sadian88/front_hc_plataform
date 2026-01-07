import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ProspectFormComponent } from './prospect-form/prospect-form.component';
import { LucideAngularModule } from 'lucide-angular';
import {
    Prospect,
    ProspectPayload,
    ProspectService
} from '../../core/services/prospect.service';

@Component({
    selector: 'app-prospect-editor-page',
    standalone: true,
    imports: [CommonModule, ProspectFormComponent, LucideAngularModule],
    templateUrl: './prospect-editor.page.html',
    styleUrl: './prospect-editor.page.scss'
})
export class ProspectEditorPageComponent implements OnInit {
    private readonly prospectService = inject(ProspectService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly loading = signal(false);
    readonly statusMessage = signal('Completa la información del prospecto.');
    readonly editId = signal<string | null>(null);
    readonly prospect = signal<Prospect | null>(null);
    readonly submitLabel = computed(() => (this.editId() ? 'Actualizar' : 'Crear'));

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (!idParam) {
            this.editId.set(null);
            this.prospect.set(null);
            return;
        }

        this.editId.set(idParam);
        this.loadProspect(idParam);
    }

    handleSave(payload: ProspectPayload): void {
        const id = this.editId();
        if (!id) return;

        this.loading.set(true);
        this.statusMessage.set('Guardando información...');

        this.prospectService
            .update(id, payload)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: () => {
                    this.statusMessage.set('Registro guardado correctamente.');
                    this.router.navigate(['/app/lead-prospecto']);
                },
                error: () => this.statusMessage.set('No se pudo guardar el prospecto.')
            });
    }

    goBack(): void {
        this.router.navigate(['/app/lead-prospecto']);
    }

    private loadProspect(id: string): void {
        this.loading.set(true);
        this.prospectService
            .loadAll()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: () => {
                    const found = this.prospectService.prospects().find((item) => item.id === id) || null;
                    if (!found) {
                        this.statusMessage.set('No se encontró el prospecto solicitado.');
                    }
                    this.prospect.set(found);
                },
                error: () => this.statusMessage.set('No fue posible cargar el prospecto.')
            });
    }
}
