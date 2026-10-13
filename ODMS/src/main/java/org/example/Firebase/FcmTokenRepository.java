
package org.example.Firebase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {

    List<FcmToken> findByUserId(Long userId);

    Optional<FcmToken> findByToken(String token);

    Optional<FcmToken> findFirstByUserIdOrderByCreatedAtDesc(Long userId);

}
