package org.example.DriverLocation;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class DriverLocationWebSocketController {

    @Autowired
    private DriverLocationService driverLocationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/driver/location")
    public void updateLocation(
            DriverLocationRequest request,
            Principal principal
    ) {
        Long driverId = Long.parseLong(principal.getName());

        DriverLocation location =
                driverLocationService.updateLocation(
                        driverId,
                        request.latitude(),
                        request.longitude()
                );

        System.out.println(
                "DRIVER LOCATION: driver=" + driverId
                        + ", lat=" + location.latitude()
                        + ", lng=" + location.longitude()
        );

        messagingTemplate.convertAndSend(
                "/topic/driver/" + driverId + "/location",
                location
        );
    }

}
