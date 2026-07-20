package org.example.Notifications;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;


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



}
