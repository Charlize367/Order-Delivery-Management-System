package org.example.Orders;

import jakarta.validation.constraints.*;
import org.example.Payment.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class OrderRequest {


    @NotBlank(message = "Address cannot be blank")
    @Size(min = 1, max = 500, message = "Address must have at least 1-500 characters")
    private String order_address;

    private Double destination_lat;
    private Double destination_lang;

    private String order_notes;


    private BigDecimal tip;


    private PaymentMethod payment_method;

    private Long promoCodeId;

    private LocalDateTime scheduledDeliveredTime;

    public String getOrder_address() {
        return order_address;
    }

    public void setOrder_address(String order_address) {
        this.order_address = order_address;
    }

    public String getOrder_notes() {
        return order_notes;
    }

    public void setOrder_notes(String order_notes) {
        this.order_notes = order_notes;
    }

    public PaymentMethod getPayment_method() {
        return payment_method;
    }

    public BigDecimal getTip() {
        return tip;
    }

    public void setTip(BigDecimal tip) {
        this.tip = tip;
    }


    public void setPayment_method(PaymentMethod payment_method) {
        this.payment_method = payment_method;
    }

    public Long getPromoCodeId() {
        return promoCodeId;
    }

    public void setPromoCodeId(Long promoCodeId) {
        this.promoCodeId = promoCodeId;
    }

    public LocalDateTime getScheduledDeliveredTime() {
        return scheduledDeliveredTime;
    }

    public void setScheduledDeliveredTime(LocalDateTime scheduledDeliveredTime) {
        this.scheduledDeliveredTime = scheduledDeliveredTime;
    }

    public Double getDestination_lat() {
        return destination_lat;
    }

    public void setDestination_lat(Double destination_lat) {
        this.destination_lat = destination_lat;
    }

    public Double getDestination_lang() {
        return destination_lang;
    }

    public void setDestination_lang(Double destination_lang) {
        this.destination_lang = destination_lang;
    }


}
