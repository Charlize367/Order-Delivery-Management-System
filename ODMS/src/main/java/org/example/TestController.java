package org.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@Controller
public class TestController {

    private final SimpMessagingTemplate messagingTemplate;

    public TestController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/hello-test")
    public void sendSpecific(Principal principal) {
        // principal.getName() is the username of the person who sent the message
        String username = principal.getName();
        String payload = "Hello " + username + ", your specific test worked!";

        // This sends to: /user/{username}/queue/specific
        messagingTemplate.convertAndSendToUser(username, "/queue/specific", payload);
    }
}
