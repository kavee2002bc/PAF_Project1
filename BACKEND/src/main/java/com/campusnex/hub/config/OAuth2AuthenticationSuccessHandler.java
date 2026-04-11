package com.campusnex.hub.config;

import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.model.enums.Role;
import com.campusnex.hub.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final String CALLBACK_URL = "http://localhost:5173/oauth2/callback";

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        if (email == null || email.isBlank()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not found in OAuth2 response");
            return;
        }

        User user = findOrCreateUser(email, name);
        String token = jwtUtil.generateToken(user.getEmail());

        String redirectUrl = UriComponentsBuilder.fromUriString(CALLBACK_URL)
                .queryParam("token", token)
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    private User findOrCreateUser(String email, String name) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }

        String displayName = (name == null || name.isBlank()) ? email : name;
        String randomPassword = passwordEncoder.encode(UUID.randomUUID().toString());

        User user = User.builder()
                .name(displayName)
                .email(email)
                .password(randomPassword)
                .role(Role.USER)
                .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=" + displayName)
                .build();

        return userRepository.save(user);
    }
}
