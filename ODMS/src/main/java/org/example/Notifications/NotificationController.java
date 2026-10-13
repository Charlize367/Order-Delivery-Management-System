package org.example.Notifications;


import org.example.Firebase.FcmService;
import org.example.Firebase.FcmToken;
import org.example.Firebase.FcmTokenRepository;
import org.example.Firebase.FcmTokenRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private FcmTokenRepository fcmTokenRepository;

    @Autowired
    private FcmService fcmService;


    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUnread(@RequestParam(required = false) Boolean unreadOnly, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        List<Notifications> entities = (Boolean.TRUE.equals(unreadOnly))
                ? notificationRepository.findByUserIdAndReadFalse(userId)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<NotificationResponse> dtoList = entities
                .stream()
                .map(entity -> {
                    NotificationResponse dto = new NotificationResponse();
                    dto.setId(entity.getId());
                    dto.setMessage(entity.getMessage());
                    dto.setCreatedAt(LocalDateTime.now());
                    dto.setRead(false);
                    dto.setUserId(entity.getUserId());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(dtoList);
    }


    @PostMapping("/fcm-token")
    public ResponseEntity<Void> saveFcmToken(
            @RequestBody FcmTokenRequest request,
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());

        System.out.println("User ID: " + userId);
        System.out.println("FCM Token: " + request.getToken());

        Optional<FcmToken> existingToken = fcmTokenRepository.findByToken(request.getToken());

        System.out.println("TOKEN EXISTS: " + existingToken.isPresent());


        if(existingToken.isEmpty()) {
            FcmToken fcmToken = new FcmToken(
                    null,
                    userId,
                    request.getToken(),
                    LocalDateTime.now()
            );

            System.out.println("CREATED AT BEFORE SAVE: " + fcmToken.getCreatedAt());



            fcmTokenRepository.save(fcmToken);
        }


        return ResponseEntity.ok().build();
    }

    @PostMapping("/test-push")
    public ResponseEntity<String> testPush(
            @RequestBody FcmTokenRequest request) {

        String messageId = fcmService.sendNotification(
                request.getToken(),
                "Test Notification",
                "FCM push notifications are working!"
        );

        return ResponseEntity.ok(messageId);
    }


}
