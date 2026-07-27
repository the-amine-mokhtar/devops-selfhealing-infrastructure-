package tn.esprit.spring.dto;

public record JwtResponse(
        String token,
        String email,
        String fullName,
        String role) {
}