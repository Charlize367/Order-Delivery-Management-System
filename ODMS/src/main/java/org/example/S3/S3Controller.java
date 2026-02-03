package org.example.S3;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/images")
public class S3Controller {

    public S3Controller(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    private final S3Service s3Service;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    @PostMapping("/initiate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PresignedUrlResponse> initiateUpload(
            @RequestBody UploadInitiateRequest request) {

        PresignedUrlResponse response = s3Service.generatePresignedUrl(
                request.getFilename(),
                request.getContentType(),
                request.getFileSize()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{filename}")
    public ResponseEntity<String> getPublicImage(@PathVariable String filename) {
        String url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/uploads/" + filename;
        return ResponseEntity.ok(url);
    }
}