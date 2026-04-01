import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.scss'
})
export class AdminPaymentsComponent implements OnInit {
  transactions = [
    {
      id: 'TXN-98234BB',
      student: 'Alex Johnson',
      course: 'Advanced Optometry Masterclass',
      amount: '₹12,499',
      date: 'Mar 25, 2026',
      status: 'Success',
      method: 'Credit Card'
    },
    {
      id: 'TXN-87122CC',
      student: 'Maria Garcia',
      course: 'Contact Lens Fitting & Care',
      amount: '₹10,500',
      date: 'Mar 24, 2026',
      status: 'Pending',
      method: 'UPI'
    },
    {
      id: 'TXN-55123AA',
      student: 'Robert Wilson',
      course: 'Retail Management for Opticians',
      amount: '₹8,999',
      date: 'Mar 23, 2026',
      status: 'Failed',
      method: 'Debit Card'
    },
    {
      id: 'TXN-44910DD',
      student: 'Sarah Brown',
      course: 'Advanced Optometry Masterclass',
      amount: '₹12,499',
      date: 'Mar 22, 2026',
      status: 'Success',
      method: 'Net Banking'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  viewReceipt(id: string) {
    console.log('Viewing receipt for', id);
  }
}
