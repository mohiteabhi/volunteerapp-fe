import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  searchQuery: string = '';
  userName: string = 'Volunteer'; // This should come from your auth service

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Initialize component, get user data from auth service
    this.getUserName();
  }

  getUserName(): void {
    
  }

  onSearchEvents(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for events:', this.searchQuery);
      this.router.navigate(['/city-events'], { queryParams: { search: this.searchQuery } });
    }
  }

  onOrganizeEvent(): void {
    console.log('Navigate to organize event page');
    this.router.navigate(['/organize-event']);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearchEvents();
    }
  }
}