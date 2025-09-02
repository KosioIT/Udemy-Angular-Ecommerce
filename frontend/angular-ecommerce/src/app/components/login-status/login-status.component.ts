import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthModule, AuthService } from "@auth0/auth0-angular";

const authService = inject(AuthService);

@Component({
  selector: "app-login-status",
  templateUrl: "./login-status.component.html",
  styleUrls: ["./login-status.component.css"],
  standalone: true,
  imports: [AuthModule, CommonModule, RouterModule],
})
export class LoginStatusComponent implements OnInit {
  isAuthenticated: boolean = false;
  userFullName: string = "";
  storage: Storage = sessionStorage;

  constructor() {}

  ngOnInit(): void {
    authService.isAuthenticated$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;

      if (isAuth) {
        authService.user$.subscribe((user) => {
          this.userFullName = user?.name ?? "";
          const email = user?.email ?? "";
          this.storage.setItem("userEmail", JSON.stringify(email));
        });
      } else {
        this.userFullName = "";
        this.storage.removeItem("userEmail");
      }
    });
  }

  login() {
    authService.loginWithRedirect();
  }

  logout(): void {
    authService.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}
