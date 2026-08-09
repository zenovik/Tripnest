import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notifications-wrapper glass-card">
      <h2>Broadcast Push & Email Center</h2>
      <p>Send marketing updates, system notices, or promo alerts to active travelers & vendors.</p>

      <div class="notify-form">
        <div class="input-field">
          <label>Target Audience</label>
          <select [(ngModel)]="targetAudience">
            <option value="ALL">All Registered Users</option>
            <option value="CUSTOMERS">Customers Only</option>
            <option value="VENDORS">Vendors Only</option>
          </select>
        </div>

        <div class="input-field">
          <label>Notification Channel</label>
          <select [(ngModel)]="channel">
            <option value="PUSH">Web Push Notification</option>
            <option value="EMAIL">Email Broadcast</option>
            <option value="SMS">SMS Message</option>
          </select>
        </div>

        <div class="input-field">
          <label>Title / Subject</label>
          <input type="text" [(ngModel)]="subject" placeholder="e.g. Exclusive Weekend Sale on Hotels!" />
        </div>

        <div class="input-field">
          <label>Message Content</label>
          <textarea [(ngModel)]="message" rows="4" placeholder="Type notification text here..."></textarea>
        </div>

        <button class="btn-gradient" (click)="sendBroadcast()">
          <span class="material-icons-outlined">send</span> Send Broadcast Notification
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-wrapper { padding: 30px; max-width: 700px; h2 { font-size: 1.5rem; margin-bottom: 6px; } p { color: var(--text-muted); margin-bottom: 24px; } }
    .notify-form { display: flex; flex-direction: column; gap: 16px; .input-field { display: flex; flex-direction: column; gap: 6px; label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); } input, select, textarea { padding: 12px; border-radius: 10px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); } } }
  `]
})
export class AdminNotificationsComponent {
  targetAudience = 'ALL';
  channel = 'PUSH';
  subject = '';
  message = '';

  sendBroadcast() {
    if (!this.subject || !this.message) {
      alert('Please fill subject and message content.');
      return;
    }
    alert(`🚀 Broadcast Notification successfully dispatched via ${this.channel} to ${this.targetAudience}!`);
    this.subject = '';
    this.message = '';
  }
}
