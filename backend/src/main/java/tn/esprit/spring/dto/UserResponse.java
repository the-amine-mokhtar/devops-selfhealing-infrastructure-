package tn.esprit.spring.dto;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role) {
}