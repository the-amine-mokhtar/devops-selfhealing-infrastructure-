package tn.esprit.spring.repository;

import tn.esprit.spring.entities.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrderByFullNameAsc(
            String fullName,
            String email);

    List<User> findAllByOrderByFullNameAsc();
}