package tn.esprit.spring.dto;

import tn.esprit.spring.entities.EngagementStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EngagementResponse(
        Long id,
        String clientName,
        EngagementStatus status,
        UserResponse consultant,
        LocalDate startDate,
        BigDecimal value,
        LocalDate deadline,
        boolean deadlineAlertSent) {
}