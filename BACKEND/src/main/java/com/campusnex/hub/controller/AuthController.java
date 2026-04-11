package com.campusnex.hub.controller;

import com.campusnex.hub.model.dto.AuthResponse;
import com.campusnex.hub.model.dto.LoginRequest;
import com.campusnex.hub.model.dto.RegisterRequest;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(Map.of(
                "id",             user.getId(),
                "name",           user.getName(),
                "email",          user.getEmail(),
                "role",           user.getRole().name(),
                "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : ""
        ));
    }
}
