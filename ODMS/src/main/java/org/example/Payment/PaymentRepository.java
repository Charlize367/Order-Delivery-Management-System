package org.example.Payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderOrderId(Long orderId);
    Optional<Payment> findByTransactionReference(String transactionReference);
    Optional<Payment> findByPaymentIntentId(String paymentIntentId);
    Boolean existsByOrderOrderId(Long orderId);
}
