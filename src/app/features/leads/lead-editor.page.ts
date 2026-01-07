import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { LeadFormComponent } from './lead-form/lead-form.component';
import { LucideAngularModule } from 'lucide-angular';
import {
    Lead,
    LeadPayload,
    LeadService
} from '../../core/services/lead.service';

@Component({
    selector: 'app-lead-editor-page',
    standalone: true,
    imports: [CommonModule, LeadFormComponent, LucideAngularModule],
    templateUrl: './lead-editor.page.html',
    styleUrl: './lead-editor.page.scss'
})
export class LeadEditorPageComponent implements OnInit {
    private readonly leadService = inject(LeadService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly loading = signal(false);
    readonly statusMessage = signal('Completa la información de la interacción.');
    readonly editId = signal<string | null>(null);
    readonly lead = signal<Lead | null>(null);
    readonly submitLabel = computed(() => (this.editId() ? 'Actualizar' : 'Crear'));

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (!idParam) {
            this.editId.set(null);
            this.lead.set(null);
            return;
        }

        this.editId.set(idParam);
        this.loadLead(idParam);
    }

    handleSave(payload: LeadPayload): void {
        const id = this.editId();
        if (!id) return;

        this.loading.set(true);
        this.statusMessage.set('Guardando información...');

        this.leadService
            .update(id, payload)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: () => {
                    this.statusMessage.set('Registro guardado correctamente.');
                    this.router.navigate(['/app/user-interactions']);
                },
                error: () => this.statusMessage.set('No se pudo guardar la interacción.')
            });
    }

    goBack(): void {
        this.router.navigate(['/app/user-interactions']);
    }

    private loadLead(id: string): void {
        this.loading.set(true);
        this.leadService
            .loadAll()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: () => {
                    const found = this.leadService.leads().find((item) => item.id_lead === id) || null;
                    if (!found) {
                        this.statusMessage.set('No se encontró la interacción solicitada.');
                    }
                    this.lead.set(found);
                },
                error: () => this.statusMessage.set('No fue posible cargar la interacción.')
            });
    }
}
