import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    SimpleChanges,
    OnChanges,
    inject
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Lead, LeadPayload } from '../../../core/services/lead.service';

@Component({
    selector: 'app-lead-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './lead-form.component.html',
    styleUrl: './lead-form.component.scss'
})
export class LeadFormComponent implements OnChanges {
    private readonly fb = inject(FormBuilder);

    @Input() lead: Lead | null = null;
    @Input() submitLabel = 'Guardar';
    @Output() save = new EventEmitter<LeadPayload>();
    @Output() cancel = new EventEmitter<void>();

    readonly form = this.fb.nonNullable.group({
        nombre: ['', [Validators.required]],
        cargo: [''],
        seniority: [''],
        rolFuncional: [''],
        empresa: [''],
        sectorEmpresa: [''],
        pais: [''],
        ciudad: [''],
        tamanoEmpresaEmpleados: [''],
        headlinePerfil: [''],
        resumenPerfil: [''],
        companyId: [''],
        linkedinUrl: ['', [Validators.required]],
        temasClavePublicaciones: [''],
        ultimasPublicacionesTexto: [''],
        interaccionesRelevantes: [''],
        tagsInternos: ['']
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['lead']) {
            return;
        }

        if (!this.lead) {
            this.resetForm();
            return;
        }

        this.form.patchValue({
            nombre: this.lead.nombre || '',
            cargo: this.lead.cargo || '',
            seniority: this.lead.seniority || '',
            rolFuncional: this.lead.rol_funcional || '',
            empresa: this.lead.empresa || '',
            sectorEmpresa: this.lead.sector_empresa || '',
            pais: this.lead.pais || '',
            ciudad: this.lead.ciudad || '',
            tamanoEmpresaEmpleados: this.lead.tamano_empresa_empleados
                ? String(this.lead.tamano_empresa_empleados)
                : '',
            headlinePerfil: this.lead.headline_perfil || '',
            resumenPerfil: this.lead.resumen_perfil || '',
            companyId: this.lead.company_id ? String(this.lead.company_id) : '',
            linkedinUrl: this.lead.linkedin_url || '',
            temasClavePublicaciones: this.formatArrayField(this.lead.temas_clave_publicaciones),
            ultimasPublicacionesTexto: this.formatArrayField(this.lead.ultimas_publicaciones_texto),
            interaccionesRelevantes: this.formatArrayField(this.lead.interacciones_relevantes),
            tagsInternos: this.formatArrayField(this.lead.tags_internos)
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload = this.buildPayload();
        this.save.emit(payload);
    }

    private resetForm(): void {
        this.form.reset({
            nombre: '',
            cargo: '',
            seniority: '',
            rolFuncional: '',
            empresa: '',
            sectorEmpresa: '',
            pais: '',
            ciudad: '',
            tamanoEmpresaEmpleados: '',
            headlinePerfil: '',
            resumenPerfil: '',
            companyId: '',
            linkedinUrl: '',
            temasClavePublicaciones: '',
            ultimasPublicacionesTexto: '',
            interaccionesRelevantes: '',
            tagsInternos: ''
        });
    }

    private buildPayload(): LeadPayload {
        const value = this.form.getRawValue();
        return {
            companyId: this.parseNumberField(value.companyId),
            nombre: value.nombre,
            cargo: this.normalizeString(value.cargo),
            seniority: this.normalizeString(value.seniority),
            rolFuncional: this.normalizeString(value.rolFuncional),
            empresa: this.normalizeString(value.empresa),
            sectorEmpresa: this.normalizeString(value.sectorEmpresa),
            pais: this.normalizeString(value.pais),
            ciudad: this.normalizeString(value.ciudad),
            tamanoEmpresaEmpleados: this.parseNumberField(value.tamanoEmpresaEmpleados),
            headlinePerfil: this.normalizeString(value.headlinePerfil),
            resumenPerfil: this.normalizeString(value.resumenPerfil),
            temasClavePublicaciones: this.parseListField(value.temasClavePublicaciones),
            ultimasPublicacionesTexto: this.parseListField(value.ultimasPublicacionesTexto),
            interaccionesRelevantes: this.parseListField(value.interaccionesRelevantes),
            tagsInternos: this.parseListField(value.tagsInternos),
            linkedinUrl: value.linkedinUrl.trim()
        };
    }

    private parseNumberField(value: string | null | undefined): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    private normalizeString(value: string | null | undefined): string | null {
        if (!value) {
            return null;
        }

        const text = value.trim();
        return text.length ? text : null;
    }

    private parseListField(value: string | null | undefined): string[] {
        if (!value) {
            return [];
        }

        return value
            .split(/[\n,]+/)
            .map((item) => item.trim())
            .filter((item) => item.length);
    }

    private formatArrayField(value: string[] | null | undefined): string {
        if (!value || !value.length) {
            return '';
        }

        return value.join('\n');
    }
}
