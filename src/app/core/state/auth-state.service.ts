import { Injectable, computed, signal } from '@angular/core';
import { LoginResponse } from '../models/auth.model';

interface StoredSession extends LoginResponse {
  lastLoginAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly storageKey = 'hc-platform-session';

  private readonly initialSession = this.readSession();
  private readonly sessionSignal = signal<LoginResponse | null>(this.initialSession);

  readonly session = computed(() => this.sessionSignal());
  readonly isAuthenticated = computed(() => !!this.sessionSignal());

  setSession(payload: LoginResponse): void {
    const enriched: StoredSession = {
      ...payload,
      lastLoginAt: new Date().toISOString()
    };

    this.sessionSignal.set(enriched);
    this.persist(enriched);
  }

  clearSession(): void {
    this.sessionSignal.set(null);
    this.removePersisted();
  }

  private readSession(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as LoginResponse) : null;
    } catch {
      return null;
    }
  }

  private persist(value: StoredSession): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  }

  private removePersisted(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // ignore storage errors
    }
  }
}
