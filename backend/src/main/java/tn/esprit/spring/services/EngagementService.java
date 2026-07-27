package tn.esprit.spring.services;

import tn.esprit.spring.dto.EngagementRequest;
import tn.esprit.spring.dto.EngagementResponse;
import tn.esprit.spring.dto.UserResponse;
import tn.esprit.spring.entities.User;
import tn.esprit.spring.entities.Engagement;
import tn.esprit.spring.entities.EngagementStatus;
import tn.esprit.spring.exception.ResourceNotFoundException;
import tn.esprit.spring.repository.EngagementRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EngagementService {

    private final EngagementRepository engagementRepository;
    private final UserService userService;

    public EngagementService(EngagementRepository engagementRepository, UserService userService) {
        this.engagementRepository = engagementRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<EngagementResponse> findAll(String search, EngagementStatus status) {
        List<Engagement> engagements = (search == null || search.isBlank()) && status == null
                ? engagementRepository.findAllWithConsultantOrderByStartDateDesc()
                : engagementRepository.search(search, status);
        return engagements.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EngagementResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    public EngagementResponse create(EngagementRequest request) {
        User consultant = userService.getEntity(request.consultantId());
        Engagement engagement = new Engagement();
        engagement.setClientName(request.clientName().trim());
        engagement.setStatus(request.status());
        engagement.setConsultant(consultant);
        engagement.setStartDate(request.startDate());
        engagement.setValue(request.value());
        engagement.setDeadline(request.deadline());
        return toResponse(engagementRepository.save(engagement));
    }

    public EngagementResponse update(Long id, EngagementRequest request) {
        Engagement engagement = getEntity(id);
        User consultant = userService.getEntity(request.consultantId());

        engagement.setClientName(request.clientName().trim());
        engagement.setStatus(request.status());
        engagement.setConsultant(consultant);
        engagement.setStartDate(request.startDate());
        engagement.setValue(request.value());
        engagement.setDeadline(request.deadline());
        return toResponse(engagementRepository.save(engagement));
    }

    public void delete(Long id) {
        Engagement engagement = getEntity(id);
        engagementRepository.delete(engagement);
    }

    @Transactional(readOnly = true)
    public Engagement getEntity(Long id) {
        return engagementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Engagement not found with id " + id));
    }

    private EngagementResponse toResponse(Engagement engagement) {
        UserResponse consultant = new UserResponse(
                engagement.getConsultant().getId(),
                engagement.getConsultant().getFullName(),
                engagement.getConsultant().getEmail(),
                engagement.getConsultant().getRole());

        return new EngagementResponse(
                engagement.getId(),
                engagement.getClientName(),
                engagement.getStatus(),
                consultant,
                engagement.getStartDate(),
                engagement.getValue(),
                engagement.getDeadline(),
                engagement.isDeadlineAlertSent());
    }
}