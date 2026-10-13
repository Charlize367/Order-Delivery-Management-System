package org.example.Orders;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.example.Deliveries.Deliveries;
import org.example.OrderItems.OrderItems;
import org.example.PromoCode.PromoCode;
import org.example.Users.Users;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Entity
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_ID")
    @NotNull(message = "Customer is required")
    private Users customer;

    @NotNull(message = "Order date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate order_date;

    @NotNull(message = "Price is required")
    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Price must not exceed 1,000,000")
    private BigDecimal order_price;

    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.00", message = "Tax must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Tax must not exceed 1,000,000")
    private BigDecimal taxAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.00", message = "Tip must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Tip must not exceed 1,000,000")
    private BigDecimal tip;

    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.00", message = "Delivery fee must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Delivery fee must not exceed 1,000,000")
    private BigDecimal deliveryAmount;

    @Column(precision = 10, scale = 2)
    @DecimalMin(value = "0.00", message = "Discount must be at least 0")
    @DecimalMax(value = "1000000.00", message = "Discount amount must not exceed 1,000,000")
    private BigDecimal discountAmount;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Order status cannot be blank")
    private OrderStatuses order_status;

    private String order_notes;

    private OrderCancellationReason order_cancel_reason;

    @NotBlank(message = "Address cannot be blank")
    @Size(min = 1, max = 500, message = "Address must have at least 1-500 characters")
    private String order_address;

    // Delivery destination coordinates
    private Double destination_lat;
    private Double destination_lng;

    @OneToMany(mappedBy = "orders", fetch = FetchType.EAGER)
    private List<OrderItems> orderItems;

    @ManyToOne(fetch = FetchType.LAZY)
    private PromoCode promoCode;

    private boolean promoCodeRedeemed = false;

    @OneToOne(mappedBy = "orders", fetch = FetchType.EAGER)
    private Deliveries deliveries;


    @NotNull
    @Column(nullable = false)
    private Long tenantId = 1L;

    public Orders() {}

    public Orders(
            Long orderId,
            Users customer,
            LocalDate order_date,
            BigDecimal order_price,
            OrderStatuses order_status,
            String order_notes,
            OrderCancellationReason order_cancel_reason,
            String order_address,
            Double destination_lat,
            Double destination_lng,
            List<OrderItems> orderItems,
            Deliveries deliveries,
            Long tenantId
    ) {
        this.orderId = orderId;
        this.customer = customer;
        this.order_date = order_date;
        this.order_price = order_price;
        this.order_status = order_status;
        this.order_notes = order_notes;
        this.order_cancel_reason = order_cancel_reason;
        this.order_address = order_address;
        this.destination_lat = destination_lat;
        this.destination_lng = destination_lng;
        this.orderItems = orderItems;
        this.deliveries = deliveries;
        this.tenantId = tenantId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Users getCustomer() {
        return customer;
    }

    public void setCustomer(Users customer) {
        this.customer = customer;
    }

    public LocalDate getOrder_date() {
        return order_date;
    }

    public void setOrder_date(LocalDate order_date) {
        this.order_date = order_date;
    }

    public BigDecimal getOrder_price() {
        return order_price;
    }

    public void setOrder_price(BigDecimal order_price) {
        this.order_price = order_price;
    }

    public OrderStatuses getOrder_status() {
        return order_status;
    }

    public void setOrder_status(OrderStatuses order_status) {
        this.order_status = order_status;
    }

    public String getOrder_notes() {
        return order_notes;
    }

    public void setOrder_notes(String order_notes) {
        this.order_notes = order_notes;
    }

    public String getOrder_address() {
        return order_address;
    }

    public void setOrder_address(String order_address) {
        this.order_address = order_address;
    }

    public Double getDestination_lat() {
        return destination_lat;
    }

    public void setDestination_lat(Double destination_lat) {
        this.destination_lat = destination_lat;
    }

    public Double getDestination_lng() {
        return destination_lng;
    }

    public void setDestination_lng(Double destination_lng) {
        this.destination_lng = destination_lng;
    }

    public List<OrderItems> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItems> orderItems) {
        this.orderItems = orderItems;
    }

    public Deliveries getDeliveries() {
        return deliveries;
    }

    public void setDeliveries(Deliveries deliveries) {
        this.deliveries = deliveries;
    }

    public PromoCode getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(PromoCode promoCode) {
        this.promoCode = promoCode;
    }

    public OrderCancellationReason getOrder_cancel_reason() {
        return order_cancel_reason;
    }

    public void setOrder_cancel_reason(OrderCancellationReason order_cancel_reason) {
        this.order_cancel_reason = order_cancel_reason;
    }

    public BigDecimal getDeliveryAmount() {
        return deliveryAmount;
    }

    public void setDeliveryAmount(BigDecimal deliveryAmount) {
        this.deliveryAmount = deliveryAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public BigDecimal getTip() {
        return tip;
    }

    public void setTip(BigDecimal tip) {
        this.tip = tip;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public boolean isPromoCodeRedeemed() {
        return promoCodeRedeemed;
    }

    public void setPromoCodeRedeemed(boolean promoCodeRedeemed) {
        this.promoCodeRedeemed = promoCodeRedeemed;
    }






    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Orders orders = (Orders) o;
        return Objects.equals(orderId, orders.orderId)
                && Objects.equals(customer, orders.customer)
                && Objects.equals(order_date, orders.order_date)
                && Objects.equals(order_price, orders.order_price)
                && Objects.equals(order_status, orders.order_status)
                && Objects.equals(order_notes, orders.order_notes)
                && Objects.equals(order_address, orders.order_address)
                && Objects.equals(destination_lat, orders.destination_lat)
                && Objects.equals(destination_lng, orders.destination_lng)
                && Objects.equals(tenantId, orders.tenantId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                orderId,
                customer,
                order_date,
                order_price,
                order_status,
                order_notes,
                order_address,
                destination_lat,
                destination_lng,
                tenantId
        );
    }
}