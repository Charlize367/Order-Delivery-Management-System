package org.example.Payment;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.example.Catalog.Catalog;
import org.example.Orders.Orders;
import org.example.Users.Users;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Entity
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @OneToOne
    private Orders order;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;


    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String transactionReference;

    private String paymentIntentId;

    private Instant paidAt;

    private Instant createdAt;

    private Instant updatedAt;

    @NotNull
    @Column(nullable = false)
    private Long tenantId = 1L;

    public Payment(Long paymentId, Orders order, BigDecimal amount, PaymentMethod method, PaymentStatus status, String transactionReference, Instant paidAt, Instant createdAt, Instant updatedAt, Long tenantId) {
        this.paymentId = paymentId;
        this.order = order;
        this.amount = amount;
        this.method = method;
        this.status = status;
        this.transactionReference = transactionReference;
        this.paidAt = paidAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.tenantId = tenantId;
    }

    public Payment() {}

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Orders getOrder() {
        return order;
    }

    public void setOrder(Orders order) {
        this.order = order;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Payment payment = (Payment) o;
        return Objects.equals(paymentId, payment.paymentId) && Objects.equals(order, payment.order) && Objects.equals(amount, payment.amount) && method == payment.method && status == payment.status && Objects.equals(transactionReference, payment.transactionReference) && Objects.equals(paidAt, payment.paidAt) && Objects.equals(createdAt, payment.createdAt) && Objects.equals(updatedAt, payment.updatedAt) && Objects.equals(tenantId, payment.tenantId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(paymentId, order, amount, method, status, transactionReference, paidAt, createdAt, updatedAt, tenantId);
    }

}
