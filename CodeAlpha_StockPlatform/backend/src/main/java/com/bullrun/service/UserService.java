package com.bullrun.service;

import com.bullrun.dto.AuthRequest;
import com.bullrun.dto.AuthResponse;
import com.bullrun.dto.RegisterRequest;
import com.bullrun.model.User;
import com.bullrun.repository.UserRepository;
import com.bullrun.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setBalance(100000.0); // ₹1,00,000 starting balance
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
            .token(token)
            .userId(user.getUserId())
            .username(user.getUsername())
            .email(user.getEmail())
            .balance(user.getBalance())
            .message("Registration successful")
            .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
            .token(token)
            .userId(user.getUserId())
            .username(user.getUsername())
            .email(user.getEmail())
            .balance(user.getBalance())
            .message("Login successful")
            .build();
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
