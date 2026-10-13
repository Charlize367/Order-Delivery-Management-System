package org.example.Payment;


import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Coupon;
import com.stripe.model.checkout.Session;
import com.stripe.param.CouponCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.Events.OrderPaidEvent;
import org.example.Events.OrderStatusChangeEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.OrderItemModifier.OrderItemModifier;
import org.example.OrderItems.OrderItems;
import org.example.Orders.OrderStatuses;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.PromoCode.PromoCodeService;
import org.example.Validator.OrderStatusTransitionValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;


import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private PromoCodeService promoCodeService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentMapper paymentMapper;

    private final OrderStatusTransitionValidator validator;


    public PaymentService(OrderStatusTransitionValidator validator, ApplicationEventPublisher publisher) {
        this.validator = validator;
        this.publisher = publisher;
    }


    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    private final ApplicationEventPublisher publisher;



    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    // for creating initial record
    private PaymentResponse recordPayment(Long orderId, PaymentMethod method, String transactionReference, String paymentIntentId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getOrder_price());
        payment.setMethod(method);
        payment.setStatus(PaymentStatus.PENDING);

        if(transactionReference != null) {
            payment.setTransactionReference(transactionReference);
        }
        payment.setCreatedAt(Instant.now());
        payment.setPaidAt(Instant.now());
        payment.setUpdatedAt(Instant.now());


        Payment savedPayment = paymentRepository.save(payment);

        return paymentMapper.toResponse(savedPayment);
    }

    // when choosing payment mode as cash, this fires
    @CacheEvict(value = {"orders", "order"}, allEntries = true)
    public PaymentResponse payOrder(PaymentRequest request) {

        Orders order = ordersRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));



        if (request.method() != PaymentMethod.CASH) {
            throw new IllegalArgumentException("This endpoint is for cash payments only. Card payments must use Stripe Checkout.");
        }

        validator.validate(order.getOrder_status(), OrderStatuses.CONFIRMED);



        PaymentResponse createPayment = recordPayment(request.orderId(), request.method(), null, null);
        order.setOrder_status(OrderStatuses.CONFIRMED);


        Deliveries delivery = deliveryRepository.findById(order.getDeliveries().getDeliveryId())
                .orElseThrow(() -> new ResourceNotFoundException("Deliveries not found"));

        if(delivery.getScheduledDeliveredTime() != null) {
            validator.validate(order.getOrder_status(), OrderStatuses.SCHEDULED);
            order.setOrder_status(OrderStatuses.SCHEDULED);
        }

        ordersRepository.save(order);


        publisher.publishEvent(new OrderStatusChangeEvent(request.orderId(), order.getOrder_status()));
        logger.info("Attempting to add new payment record with ID: {}", request.orderId());
        return createPayment;

    }

    // for confirming cash payment received after delivery
    public PaymentResponse confirmCashReceived(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));



        if (payment.getStatus() == PaymentStatus.PAID) {
            return paymentMapper.toResponse(payment);
        }


        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        payment.setUpdatedAt(Instant.now());

        if(payment.getOrder().getPromoCode() != null) {
            promoCodeService.redeemPromoCode(payment.getOrder(), payment.getOrder().getPromoCode().getPromoCodeId());
        }

        Payment savedPayment = paymentRepository.save(payment);
        publisher.publishEvent(new OrderPaidEvent(payment.getOrder().getOrderId(), savedPayment.getPaymentId()));
        return paymentMapper.toResponse(savedPayment);
    }

    // for confirming stripe payments

    @CacheEvict(value = {"orders", "order", "queuedOrders"}, allEntries = true)
    public void markOrderPaid(String sessionId) {
        Payment payment = paymentRepository.findByTransactionReference(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for session: " + sessionId));

        logger.info("Marking order paid for session ID: {} ", sessionId);
        if (payment.getStatus() == PaymentStatus.PAID) {
            logger.info("Payment already processed");
            return; // already processed, ignore duplicate webhook
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);


        logger.info("Attempting to publish OrderPaidEvent for Order {} : ", payment.getOrder().getOrderId() );
        publisher.publishEvent(new OrderPaidEvent(payment.getOrder().getOrderId(), payment.getPaymentId()));
    }


    // triggering stripe payments
    public String createCheckoutSession(Long orderId) throws StripeException {

        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));

        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        // =========================
        // ORDER ITEMS
        // =========================

        for (OrderItems item : order.getOrderItems()) {

            BigDecimal price;

            String name;

            if (item.getOrder_catalog() != null) {
                name = item.getOrder_catalog().getCatalogName();
                price = item.getOrder_catalog().getCatalog_price();


            } else if (item.getCombo() != null) {
                name = item.getCombo().getName();
                price = item.getCombo().getBundlePrice();


            } else {
                throw new IllegalStateException("Order item has neither catalog nor combo");
            }








            if (price == null) {
                throw new IllegalArgumentException(
                        "Catalog price cannot be null for item: "
                                + item.getOrder_catalog().getCatalogName()
                );
            }



            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(item.getQuantity().longValue())
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("php")
                                            .setUnitAmount(
                                                    price
                                                            .multiply(BigDecimal.valueOf(100))
                                                            .longValueExact()
                                            )
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(name)
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        // =========================
        // TAX
        // =========================

        if (order.getTaxAmount() != null
                && order.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {

            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("php")
                                            .setUnitAmount(
                                                    order.getTaxAmount()
                                                            .multiply(BigDecimal.valueOf(100))
                                                            .longValueExact()
                                            )
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("Tax")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        // =========================
        // DELIVERY FEE
        // =========================

        if (order.getDeliveryAmount() != null
                && order.getDeliveryAmount().compareTo(BigDecimal.ZERO) > 0) {

            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("php")
                                            .setUnitAmount(
                                                    order.getDeliveryAmount()
                                                            .multiply(BigDecimal.valueOf(100))
                                                            .longValueExact()
                                            )
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("Delivery Fee")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        // =========================
        // TIP
        // =========================

        if (order.getTip() != null
                && order.getTip().compareTo(BigDecimal.ZERO) > 0) {

            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("php")
                                            .setUnitAmount(
                                                    order.getTip()
                                                            .multiply(BigDecimal.valueOf(100))
                                                            .longValueExact()
                                            )
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("Tip")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        // =========================
// MODIFIER
// =========================

        BigDecimal modifierSum = BigDecimal.ZERO;
        for (OrderItems orderItems : order.getOrderItems()) {
            BigDecimal itemModifierTotal = BigDecimal.ZERO;
            for (OrderItemModifier orderItemModifier : orderItems.getOrderItemModifiers()) {
                itemModifierTotal = itemModifierTotal.add(orderItemModifier.getPriceAdjustment());
            }
            modifierSum = modifierSum.add(itemModifierTotal.multiply(BigDecimal.valueOf(orderItems.getQuantity())));
        }

        if (modifierSum.compareTo(BigDecimal.ZERO) > 0) {

            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("php")
                                            .setUnitAmount(
                                                    modifierSum
                                                            .multiply(BigDecimal.valueOf(100))
                                                            .longValueExact()
                                            )
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("Modifiers")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }



        // =========================
        // SESSION
        // =========================

        SessionCreateParams.Builder sessionBuilder =
                SessionCreateParams.builder()
                        .setSuccessUrl(
                                "http://localhost:5173/order/"
                                        + orderId
                                        + "/success"
                        )
                        .setCancelUrl(
                                "http://localhost:5173/checkout/"
                                        + orderId
                        )
                        .addAllLineItem(lineItems)
                        .putMetadata("orderId", orderId.toString())
                        .setMode(SessionCreateParams.Mode.PAYMENT);

        // =========================
        // PROMO / DISCOUNT
        // =========================

        if (order.getPromoCode() != null
                && order.getDiscountAmount() != null
                && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {

            CouponCreateParams couponParams =
                    CouponCreateParams.builder()
                            .setAmountOff(
                                    order.getDiscountAmount()
                                            .multiply(BigDecimal.valueOf(100))
                                            .longValueExact()
                            )
                            .setCurrency("php")
                            .setDuration(CouponCreateParams.Duration.ONCE)
                            .setName(order.getPromoCode().getCode())
                            .build();

            Coupon coupon = Coupon.create(couponParams);

            sessionBuilder.addDiscount(
                    SessionCreateParams.Discount.builder()
                            .setCoupon(coupon.getId())
                            .build()
            );
        }

        // =========================
        // CREATE CHECKOUT SESSION
        // =========================

        Session session = Session.create(sessionBuilder.build());

        // DO NOT treat this as a successful payment.
        // The webhook should record/confirm the payment after Stripe
        // tells your backend that payment succeeded.

        recordPayment(orderId, PaymentMethod.CREDIT_CARD, session.getId(), session.getPaymentIntent());

        return session.getUrl();
    }


    public PaymentResponse changeStatus(Long paymentId, PaymentStatus paymentStatus) {
        logger.info("Attempting to change payment status into {} for Payment ID: {}", paymentStatus, paymentId);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found."));

        payment.setStatus(paymentStatus);
        Payment updatedPaymentRecord = paymentRepository.save(payment);
        return paymentMapper.toResponse(updatedPaymentRecord);
    }

    public void markStripePaymentAsFailed(String paymentIntentId) {
        logger.info("Failed order for Payment ID: {}", paymentIntentId);
        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found."));

        payment.setStatus(PaymentStatus.FAILED);
        Payment updatedPaymentRecord = paymentRepository.save(payment);
        paymentMapper.toResponse(updatedPaymentRecord);
    }


    public PaymentResponse markCashPaymentAsFailed(Long paymentId) {
        logger.info("Failed cash order for Payment ID: {}", paymentId);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found."));

        payment.setStatus(PaymentStatus.FAILED);
        Payment updatedPaymentRecord = paymentRepository.save(payment);

        return paymentMapper.toResponse(updatedPaymentRecord);
    }

    public PaymentResponse getPaymentByOrder(Long orderId) {
        logger.info("Attempting to get payment details for Order ID: {}", orderId);
        Payment payment = paymentRepository.findByOrderOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found."));
        return paymentMapper.toResponse(payment);
    }


    public PaymentResponse getPaymentById(Long id) {
        logger.info("Attempting to get payment details for Payment ID: {}", id);
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found."));
        return paymentMapper.toResponse(payment);
    }
}
