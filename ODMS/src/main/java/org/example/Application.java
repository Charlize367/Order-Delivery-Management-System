package org.example;

import jakarta.annotation.PostConstruct;
import javafx.stage.Stage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;



@SpringBootApplication
@EnableCaching
@EnableAsync
@RestController

public abstract class Application  {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }


    @GetMapping
    public String HelloWorld(){
        return "Hello World Spring Boot";
    }

    public abstract void start(Stage primaryStage);


    @Component
    public class BeanDebugger {

        @Autowired
        private ApplicationContext context;

        @PostConstruct
        public void listJwtEncoders() {
            String[] beans = context.getBeanNamesForType(JwtEncoder.class);
            System.out.println("JwtEncoder beans in context:");
            for (String beanName : beans) {
                Object bean = context.getBean(beanName);
                System.out.println(" - " + beanName + " : " + bean.getClass().getName());
            }
        }
    }
}

