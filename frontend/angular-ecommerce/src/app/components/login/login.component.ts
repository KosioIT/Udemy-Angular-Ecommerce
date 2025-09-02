import { Component, inject, OnInit } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";

const authService = inject(AuthService);

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  standalone: true,
})
export class LoginComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    authService.loginWithRedirect();
  }
}
