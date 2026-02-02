package org.example;

import javafx.stage.Stage;
import org.example.Config.RsaKeyProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@EnableConfigurationProperties(RsaKeyProperties.class)
@SpringBootApplication
@EnableCaching
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
}

