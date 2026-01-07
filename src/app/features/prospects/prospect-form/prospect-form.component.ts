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
import { Prospect, ProspectPayload } from '../../../core/services/prospect.service';

@Component({
    selector: 'app-prospect-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './prospect-form.component.html',
    styleUrl: './prospect-form.component.scss'
})
export class ProspectFormComponent implements OnChanges {
    private readonly fb = inject(FormBuilder);

    @Input() prospect: Prospect | null = null;
    @Input() submitLabel = 'Guardar';
    @Output() save = new EventEmitter<ProspectPayload>();
    @Output() cancel = new EventEmitter<void>();

    readonly form = this.fb.nonNullable.group({
        nombreCompleto: ['', [Validators.required]],
        email: [''],
        perfilLinkedin: [''],
        cargo: [''],
        about: [''],
        location: [''],
        estado: [''],
        fechaCreacionOrigen: [''],
        companyId: [''],
        companyOrigenLead: ['']
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['prospect']) {
            return;
        }

        if (!this.prospect) {
            this.resetForm();
            return;
        }

        this.form.patchValue({
            nombreCompleto: this.prospect.nombre_completo || '',
            email: this.prospect.email || '',
            perfilLinkedin: this.prospect.perfil_linkedin || '',
            cargo: this.prospect.cargo || '',
            about: this.prospect.about || '',
            location: this.prospect.location || '',
            estado: this.prospect.estado || '',
            fechaCreacionOrigen: this.formatDateInput(this.prospect.fecha_creacion_origen),
            companyId: this.prospect.company_id ? String(this.prospect.company_id) : '',
            companyOrigenLead: this.prospect.company_origen_lead || ''
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
            nombreCompleto: '',
            email: '',
            perfilLinkedin: '',
            cargo: '',
            about: '',
            location: '',
            estado: '',
            fechaCreacionOrigen: '',
            companyId: '',
            companyOrigenLead: ''
        });
    }

    private buildPayload(): ProspectPayload {
        const value = this.form.getRawValue();
        return {
            nombreCompleto: value.nombreCompleto.trim(),
            email: this.normalizeString(value.email),
            perfilLinkedin: this.normalizeString(value.perfilLinkedin),
            cargo: this.normalizeString(value.cargo),
            about: this.normalizeString(value.about),
            location: this.normalizeString(value.location),
            estado: this.normalizeString(value.estado),
            fechaCreacionOrigen: this.normalizeDateTime(value.fechaCreacionOrigen),
            companyId: this.parseNumberField(value.companyId),
            companyOrigenLead: this.normalizeString(value.companyOrigenLead)
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

    private normalizeDateTime(value: string | null | undefined): string | null {
        if (!value) {
            return null;
        }

        const date = new Date(value);
        return Number.isNaN(date.valueOf()) ? null : date.toISOString();
    }

    private formatDateInput(value: string | null | undefined): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        if (Number.isNaN(date.valueOf())) {
            return '';
        }

        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
    }
}
