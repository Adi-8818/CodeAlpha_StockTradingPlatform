package com.bullrun.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private Double balance;
    private String message;
}
