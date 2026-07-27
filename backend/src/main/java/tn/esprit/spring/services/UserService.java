package tn.esprit.spring.services;

import tn.esprit.spring.dto.UserRequest;
import tn.esprit.spring.dto.UserResponse;
import tn.esprit.spring.entities.User;
import tn.esprit.spring.exception.ResourceNotFoundException;
import tn.esprit.spring.repository.UserRepository;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll(String search) {
        List<User> users = search == null || search.isBlank()
                ? userRepository.findAllByOrderByFullNameAsc()
                : userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrderByFullNameAsc(search, search);
        return users.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    public UserResponse create(UserRequest request) {
        userRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            throw new IllegalArgumentException("Email already exists");
        });

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setRole(request.role().trim());
        user.setPassword(passwordEncoder.encode(request.password() != null ? request.password() : "changeme"));
        return toResponse(userRepository.save(user));
    }

    public UserResponse update(Long id, UserRequest request) {
        User user = getEntity(id);
        userRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Email already exists");
            }
        });

        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setRole(request.role().trim());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        return toResponse(userRepository.save(user));
    }

    public void delete(Long id) {
        User user = getEntity(id);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public User getEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }
}