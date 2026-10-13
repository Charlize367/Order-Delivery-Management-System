package org.example.Ratings;

import jakarta.validation.Valid;
import org.example.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping("/catalog/{catalogId}")
    public ResponseEntity<RatingResponse> createRating(
            @PathVariable Long catalogId,
            @RequestParam Long userId,
            @Valid @RequestBody RatingRequest request
    ) {

        RatingResponse response =
                ratingService.createRating(
                        catalogId,
                        userId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<PageResponse<RatingResponse>> getRatings(
            @PathVariable Long catalogId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "true") boolean descending
    ) {

        Sort sort = descending
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
                ratingService.getRatingsByCatalog(
                        catalogId,
                        pageable
                )
        );
    }

    @PutMapping("/{ratingId}")
    public ResponseEntity<RatingResponse> updateRating(
            @PathVariable Long ratingId,
            @RequestParam Long userId,
            @Valid @RequestBody RatingRequest request
    ) {

        RatingResponse response =
                ratingService.updateRating(
                        ratingId,
                        userId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{ratingId}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long ratingId,
            @RequestParam Long userId
    ) {

        ratingService.deleteRating(
                ratingId,
                userId
        );

        return ResponseEntity.noContent().build();
    }
}