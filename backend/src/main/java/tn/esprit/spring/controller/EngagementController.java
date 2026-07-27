package tn.esprit.spring.controller;

import tn.esprit.spring.dto.EngagementRequest;
import tn.esprit.spring.dto.EngagementResponse;
import tn.esprit.spring.entities.EngagementStatus;
import tn.esprit.spring.services.EngagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/engagements")
public class EngagementController {

    private final EngagementService engagementService;

    public EngagementController(EngagementService engagementService) {
        this.engagementService = engagementService;
    }

    @GetMapping
    public List<EngagementResponse> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EngagementStatus status) {
        return engagementService.findAll(search, status);
    }

    @GetMapping("/{id}")
    public EngagementResponse getById(@PathVariable Long id) {
        return engagementService.findById(id);
    }

    @PostMapping
    public ResponseEntity<EngagementResponse> create(@Valid @RequestBody EngagementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(engagementService.create(request));
    }

    @PutMapping("/{id}")
    public EngagementResponse update(@PathVariable Long id, @Valid @RequestBody EngagementRequest request) {
        return engagementService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        engagementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}