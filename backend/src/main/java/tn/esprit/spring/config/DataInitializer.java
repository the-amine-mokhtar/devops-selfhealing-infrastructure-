package tn.esprit.spring.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tn.esprit.spring.entities.User;
import tn.esprit.spring.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmailIgnoreCase("admin@ey.com").isEmpty()) {
            User admin = new User();
            admin.setFullName("Admin");
            admin.setEmail("admin@ey.com");
            admin.setRole("Admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            log.info("Default admin created: admin@ey.com / admin123");
        }

        setPassword("amine.mokhtar@esprit.tn", "Amine123!");
        setPassword("admin@ey.com", "admin123");

        for (User user : userRepository.findAll()) {
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode("Changeme1"));
                userRepository.save(user);
                log.info("Set default password for {} <{}>", user.getFullName(), user.getEmail());
            }
        }
    }

    private void setPassword(String email, String rawPassword) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            log.info("Password set for {} -> {}", email, rawPassword);
        });
    }
}