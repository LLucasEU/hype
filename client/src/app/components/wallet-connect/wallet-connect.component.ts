import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.scss']
})
export class WalletConnectComponent {
  @Output() walletConnected = new EventEmitter<string>();
  
  walletForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(private fb: FormBuilder) {
    this.walletForm = this.fb.group({
      walletAddress: ['', [
        Validators.required,
        Validators.pattern(/^0x[a-fA-F0-9]{40}$/)
      ]]
    });

    // Charger l'adresse depuis le localStorage si elle existe
    const savedAddress = localStorage.getItem('hype_wallet_address');
    if (savedAddress) {
      this.walletForm.patchValue({ walletAddress: savedAddress });
    }
  }

  async pasteFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.match(/^0x[a-fA-F0-9]{40}$/)) {
        this.walletForm.patchValue({ walletAddress: text });
      } else {
        this.error = 'Adresse invalide dans le presse-papiers';
      }
    } catch (error) {
      this.error = 'Impossible d\'accéder au presse-papiers';
      console.error('Erreur clipboard:', error);
    }
  }

  connectWallet(): void {
    if (this.walletForm.valid) {
      this.isLoading = true;
      this.error = '';
      
      const address = this.walletForm.get('walletAddress')?.value;
      
      // Sauvegarder l'adresse dans le localStorage
      localStorage.setItem('hype_wallet_address', address);
      
      // Simuler un délai de connexion
      setTimeout(() => {
        this.isLoading = false;
        this.walletConnected.emit(address);
      }, 1000);
    } else {
      this.error = 'Veuillez entrer une adresse de wallet valide';
    }
  }

  clearError(): void {
    this.error = '';
  }

  getErrorMessage(): string {
    const control = this.walletForm.get('walletAddress');
    if (control?.hasError('required')) {
      return 'L\'adresse du wallet est requise';
    }
    if (control?.hasError('pattern')) {
      return 'Format d\'adresse invalide (doit commencer par 0x et contenir 40 caractères hexadécimaux)';
    }
    return '';
  }
} 