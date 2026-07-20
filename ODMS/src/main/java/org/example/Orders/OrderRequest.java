package org.example.Orders;

import jakarta.validation.constraints.*;

public class OrderRequest {


    @NotBlank(message = "Address cannot be blank")
    @Size(min = 1, max = 50, message = "Address must have at least 1-50 characters")
    private String order_address;

    private String order_notes;

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




}
