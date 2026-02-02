package org.example.Orders;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class OrderRequest {


    @NotBlank(message = "Address cannot be blank")
    @Size(min = 1, max = 50, message = "Address must have at least 1-50 characters")
    private String address;

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }



}
