package org.example;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SessionActivityService {

    @Value("${app.session.idle-timeout-ms}")
    private long idleTimeoutMs;

    public long getIdleTimeoutMs() {
        return idleTimeoutMs;
    }
}