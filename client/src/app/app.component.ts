import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'HYPE Mobile App';
  walletAddress = '';
  selectedTab = 0;
  isConnected = false;

  onWalletConnected(address: string): void {
    this.walletAddress = address;
    this.isConnected = true;
  }

  disconnectWallet(): void {
    this.walletAddress = '';
    this.isConnected = false;
    this.selectedTab = 0;
    localStorage.removeItem('hype_wallet_address');
  }
}
