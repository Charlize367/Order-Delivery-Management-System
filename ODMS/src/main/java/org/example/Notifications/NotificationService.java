package org.example.Notifications;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(
            Long userId,
            NotificationType type,
            String message,
            Long orderId) {

        Notifications notification = new Notifications();

        notification.setUserId(userId);
        notification.setType(type);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setOrderId(orderId);

        notificationRepository.save(notification);
    }
}
