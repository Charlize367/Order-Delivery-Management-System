package org.example.Notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


public interface NotificationRepository extends JpaRepository<Notifications, Long> {
    List<Notifications> findByUserIdAndReadFalse(Long userId);
    List<Notifications> findByUserIdOrderByCreatedAtDesc(Long userId);
}
