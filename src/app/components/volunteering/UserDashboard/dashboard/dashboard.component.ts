import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  searchQuery: string = '';
  userName: string = 'Volunteer'; // This should come from your auth service
  sidebarOpen: boolean = false;
  userId: any;
  

  constructor(private router: Router, private auth: AuthService, private userService: UserService) { }

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
        this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.userName = user.fullName
      },
      error: (error) => {
        console.error('Failed to load user data', error); // Still allow form submission
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
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

  // Sidebar navigation methods
  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
    this.sidebarOpen = false;
  }

  navigateToEventsJoined(): void {
    this.router.navigate(['/events-joined']);
    this.sidebarOpen = false;
  }

  navigateToEventsOrganized(): void {
    this.router.navigate(['/events-organized']);
    this.sidebarOpen = false;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.sidebarOpen = false;
  }

  logout(): void {
    // Implement logout logic here
    // Example: this.authService.logout();
    this.auth.logout();
    console.log('Logging out...');
    this.router.navigate(['/login']);
    this.sidebarOpen = false;
  }
}