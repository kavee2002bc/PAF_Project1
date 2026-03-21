package com.campusnex.hub.service;

import com.campusnex.hub.config.JwtUtil;
import com.campusnex.hub.model.dto.AuthResponse;
import com.campusnex.hub.model.dto.LoginRequest;
import com.campusnex.hub.model.dto.RegisterRequest;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.model.enums.Role;
import com.campusnex.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered: " + email);
        }

        Role role = Role.USER;
        if (request.getRole() != null) {
            try { role = Role.valueOf(request.getRole().toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        User user = User.builder()
                .name(request.getName())
            .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.getName())
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());

        return buildResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());
        return buildResponse(token, user);
    }

    private AuthResponse buildResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
