package tn.esprit.spring.dto;

import tn.esprit.spring.entities.EngagementStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EngagementRequest(
        @NotBlank(message = "Client name is required") String clientName,
        @NotNull(message = "Status is required") EngagementStatus status,
        @NotNull(message = "Consultant is required") Long consultantId,
        @NotNull(message = "Start date is required") LocalDate startDate,
        @NotNull(message = "Value is required") @PositiveOrZero(message = "Value must be zero or positive") BigDecimal value,
        @NotNull(message = "Deadline is required") LocalDate deadline,
        String logo) {
}