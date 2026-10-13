package org.example.Listeners;

import org.example.Events.DriverAssignedEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.Firebase.FcmService;
import org.example.Firebase.FcmToken;
import org.example.Firebase.FcmTokenRepository;
import org.example.Notifications.NotificationResponse;
import org.example.Notifications.NotificationType;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class DriverAssignedWebSocketListener {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private FcmService fcmService;

    @Autowired
    private FcmTokenRepository fcmTokenRepository;

    public DriverAssignedWebSocketListener(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
    }


    @EventListener
    public void handle(DriverAssignedEvent event) {

        Orders order = ordersRepository.findById(event.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + event.orderId()));
        Users driver = usersRepository.findById(event.driverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + event.driverId()));

        NotificationResponse driverResponse =
                new NotificationResponse(
                        null,
                        event.driverId(),
                        event.orderId(),
                        NotificationType.DRIVER_ASSIGNED,
                        "You have been assigned Order #" + event.orderId(),
                        false,
                        LocalDateTime.now(),
                        order.getOrder_status().toString()

                );


        NotificationResponse customerResponse =
                new NotificationResponse(
                        null,
                        order.getCustomer().getUserId(),
                        event.orderId(),
                        NotificationType.DRIVER_ASSIGNED,
                        "Your assigned driver is " + driver.getUsername(),
                        false,
                        LocalDateTime.now(),
                        order.getOrder_status().toString()

                );


        // for driver
        messagingTemplate.convertAndSendToUser(
                event.driverId().toString(),
                "/queue/notifications",
                driverResponse
        );


        // for driver
        messagingTemplate.convertAndSendToUser(
                order.getCustomer().getUserId().toString(),
                "/queue/notifications",
                customerResponse
        );


        messagingTemplate.convertAndSend(
                "/topic/orders/" + order.getOrderId(),
                customerResponse
        );


        Optional<FcmToken> latestToken =
                fcmTokenRepository.findFirstByUserIdOrderByCreatedAtDesc(order.getCustomer().getUserId());

        latestToken.ifPresent(token ->
                fcmService.sendNotification(
                        token.getToken(),
                        "Order Update",
                        customerResponse.getMessage()
                )
        );



        Optional<FcmToken> latestToken2 =
                fcmTokenRepository.findFirstByUserIdOrderByCreatedAtDesc(event.driverId());

        latestToken2.ifPresent(token ->
                fcmService.sendNotification(
                        token.getToken(),
                        "Order Update",
                        driverResponse.getMessage()
                )
        );


    }
}