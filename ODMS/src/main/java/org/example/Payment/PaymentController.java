package org.example.Payment;

import com.nimbusds.jose.shaded.gson.JsonObject;
import com.nimbusds.jose.shaded.gson.JsonParser;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.example.Notifications.NotificationRepository;
import org.example.Notifications.NotificationResponse;
import org.example.Notifications.Notifications;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PaymentService paymentService;

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @PostMapping("/checkout/{orderId}")
    public ResponseEntity<Map<String, String>> createCheckout(
            @PathVariable Long orderId,
            Authentication authentication) throws StripeException {

        String url = paymentService.createCheckoutSession(orderId);
        return ResponseEntity.ok(Map.of("url", url));
    }


    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            logger.warn("Webhook signature verification failed.");
            return ResponseEntity.status(400).body("Invalid signature");
        }

        logger.info("Received Stripe event: {} (id: {})", event.getType(), event.getId());


        if ("checkout.session.completed".equals(event.getType())) {

            try {

                JsonObject rawJson = JsonParser.parseString(payload).getAsJsonObject();
                String sessionId = rawJson.getAsJsonObject("data")
                        .getAsJsonObject("object")
                        .get("id").getAsString();

                logger.info("Processing checkout.session.completed for session {}", sessionId);
                paymentService.markOrderPaid(sessionId);
                logger.info("markOrderPaid completed for session {}", sessionId);

            } catch (Exception e) {
                logger.error("Failed to process checkout.session.completed for event {}", event.getId(), e);

                return ResponseEntity.status(500).body("Internal error processing event" );
            }
        } else if ("payment_intent.payment_failed".equals(event.getType())) {
            JsonObject rawJson = JsonParser.parseString(payload).getAsJsonObject();
            String paymentIntentId = rawJson.getAsJsonObject("data")
                    .getAsJsonObject("object")
                    .get("id").getAsString();
            paymentService.markStripePaymentAsFailed(paymentIntentId);

        }

        return ResponseEntity.ok("received");
    }


    @PostMapping
    public ResponseEntity<PaymentResponse> payOrder(@RequestBody PaymentRequest request) {
        PaymentResponse payment = paymentService.payOrder(request);
        return new ResponseEntity<>(payment, HttpStatus.OK);
    }


    @GetMapping("/order/{orderId}")
    public PaymentResponse getPaymentByOrder(@PathVariable Long orderId) {
        return paymentService.getPaymentByOrder(orderId);
    }

    @GetMapping("/{id}")
    public PaymentResponse getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }


    @PatchMapping("/status/{id}")
    public ResponseEntity<PaymentResponse> updatePaymentStatus(@PathVariable Long id, @RequestBody PaymentStatus status) {
        PaymentResponse payment = paymentService.changeStatus(id, status);
        return new ResponseEntity<>(payment, HttpStatus.OK);
    }

    @PatchMapping("/failed/{id}")
    public ResponseEntity<PaymentResponse> markCashPaymentAsFailed(@PathVariable Long id) {
        PaymentResponse paymentFailed = paymentService.markCashPaymentAsFailed(id);
        return new ResponseEntity<>(paymentFailed, HttpStatus.OK);
    }

    @PatchMapping("/received/{id}")
    public ResponseEntity<PaymentResponse> confirmCashReceived(@PathVariable Long id) {
        PaymentResponse payment = paymentService.confirmCashReceived(id);
        return new ResponseEntity<>(payment, HttpStatus.OK);
    }



}

