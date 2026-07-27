package tn.esprit.spring.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.spring.entities.Engagement;
import tn.esprit.spring.entities.User;
import tn.esprit.spring.repository.EngagementRepository;

import java.util.List;

@Service
public class EngagementAlertService {

    private static final Logger log = LoggerFactory.getLogger(EngagementAlertService.class);

    private final EngagementRepository engagementRepository;
    private final EmailService emailService;

    @Value("${engagement.alert.high-demand-threshold:3}")
    private long highDemandThreshold;

    public EngagementAlertService(EngagementRepository engagementRepository, EmailService emailService) {
        this.engagementRepository = engagementRepository;
        this.emailService = emailService;
    }

    @Scheduled(fixedRate = 30_000)
    @Transactional
    public void checkDeadlines() {
        List<Engagement> overdue = engagementRepository.findOverdueEngagementsWithoutAlert();
        for (Engagement e : overdue) {
            try {
                User consultant = e.getConsultant();
                String html = emailService.buildDeadlineAlertHtml(
                        consultant.getFullName(),
                        e.getClientName(),
                        e.getDeadline().toString(),
                        e.getStatus().name());
                emailService.sendHtmlEmail(consultant.getEmail(),
                        "EY Alert: Deadline Overdue - " + e.getClientName(), html);
                e.setDeadlineAlertSent(true);
                engagementRepository.save(e);
                log.info("Deadline alert sent to {} for engagement {}", consultant.getEmail(), e.getId());
            } catch (Exception ex) {
                log.error("Failed to send deadline alert for engagement {}: {}", e.getId(), ex.getMessage());
            }
        }
    }

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void checkHighDemand() {
        List<Object[]> results = engagementRepository.countActiveEngagementsByConsultant(highDemandThreshold);
        for (Object[] row : results) {
            User consultant = (User) row[0];
            long count = (long) row[1];
            try {
                String html = emailService.buildHighDemandAlertHtml(consultant.getFullName(), count);
                emailService.sendHtmlEmail(consultant.getEmail(),
                        "EY Alert: High Engagement Demand - " + consultant.getFullName(), html);
                log.info("High-demand alert sent to {} ({} active engagements)", consultant.getEmail(), count);
            } catch (Exception ex) {
                log.error("Failed to send high-demand alert to {}: {}", consultant.getEmail(), ex.getMessage());
            }
        }
    }
}
