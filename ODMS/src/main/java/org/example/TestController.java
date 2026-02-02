package org.example;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/admin/hello")
    public String adminHello() {
        return "Hello Admin!";
    }

    @GetMapping("/customer/hello")
    public String customerHello() {
        return "Hello Customer!";
    }

    @GetMapping("/delivery/hello")
    public String deliveryHello() {
        return "Hello Delivery Guy!";
    }
}
