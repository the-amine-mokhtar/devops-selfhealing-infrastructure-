package tn.esprit.spring.repository;

import tn.esprit.spring.entities.Engagement;
import tn.esprit.spring.entities.EngagementStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EngagementRepository extends JpaRepository<Engagement, Long> {

    @Query("select e from Engagement e join fetch e.consultant where e.deadline < current_date and e.deadlineAlertSent = false and e.status <> 'COMPLETED'")
    List<Engagement> findOverdueEngagementsWithoutAlert();

    @Query("select e.consultant, count(e) from Engagement e where e.status <> 'COMPLETED' group by e.consultant having count(e) >= :threshold")
    List<Object[]> countActiveEngagementsByConsultant(@Param("threshold") long threshold);

    @Query("""
            select e
            from Engagement e
            join fetch e.consultant c
            where (:status is null or e.status = :status)
              and (
                :search is null or :search = '' or
                lower(e.clientName) like lower(concat('%', :search, '%')) or
                lower(c.fullName) like lower(concat('%', :search, '%'))
              )
            order by e.startDate desc, e.id desc
            """)
    List<Engagement> search(@Param("search") String search, @Param("status") EngagementStatus status);

    @Query("select e from Engagement e join fetch e.consultant order by e.startDate desc, e.id desc")
    List<Engagement> findAllWithConsultantOrderByStartDateDesc();

    List<Engagement> findByStatus(EngagementStatus status);

    List<Engagement> findByClientNameContainingIgnoreCaseOrConsultantFullNameContainingIgnoreCase(String clientName, String consultantName);
}