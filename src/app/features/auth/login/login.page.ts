import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStateService } from '../../../core/state/auth-state.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly statusMessage = signal('Integra tus flujos operativos con seguridad total.');
  readonly errorMessage = signal('');
  readonly successUser = signal<string | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: this.fb.nonNullable.control(true)
  });

  readonly isFormInvalid = computed(() => this.loginForm.invalid && this.loginForm.touched);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successUser.set(null);
    this.statusMessage.set('Validando credenciales y preparando tu tablero...');

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.authState.setSession(response);
          this.statusMessage.set('Todo listo, redirigiendo a tu consola principal.');
          this.successUser.set(response.user.firstName || response.user.email);
          this.router.navigateByUrl('/app/dashboard');
        },
        error: (error: HttpErrorResponse) => {
          const message =
            error.error?.error?.message ||
            error.error?.message ||
            'No pudimos validar tus credenciales. Intenta nuevamente.';
          this.errorMessage.set(message);
          this.statusMessage.set('Revisa los datos ingresados y vuelve a intentarlo.');
        }
      });
  }

  getEmailError(): string | null {
    const control = this.loginForm.controls.email;
    if (!control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return 'El email es obligatorio';
    }
    if (control.hasError('email')) {
      return 'Formato de email inválido';
    }
    return null;
  }

  getPasswordError(): string | null {
    const control = this.loginForm.controls.password;
    if (!control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return 'La contraseña es obligatoria';
    }
    if (control.hasError('minlength')) {
      return 'Se requieren al menos 8 caracteres';
    }
    return null;
  }
}
