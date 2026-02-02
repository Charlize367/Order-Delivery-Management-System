package org.example.Exception;




import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;


@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException resourceNotFound, WebRequest webRequest) {
        ErrorResponse errorResponse = new ErrorResponse(
                System.currentTimeMillis(),
                resourceNotFound.getMessage(),
                webRequest.getDescription(false),
                HttpStatus.NOT_FOUND,
                HttpStatus.NOT_FOUND.value()
        );


        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);


    }

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<Object> handleResourceAlreadyExistsException(ResourceAlreadyExistsException alreadyExistsException, WebRequest webRequest) {
        ErrorResponse errorResponse = new ErrorResponse(
                System.currentTimeMillis(),
                alreadyExistsException.getMessage(),
                webRequest.getDescription(false),
                HttpStatus.CONFLICT,
                HttpStatus.CONFLICT.value()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);


    }

    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException runtimeException, WebRequest webRequest) {
        ErrorResponse errorResponse = new ErrorResponse(
                System.currentTimeMillis(),
                runtimeException.getMessage(),
                webRequest.getDescription(false),
                HttpStatus.INTERNAL_SERVER_ERROR,
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );


        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });


        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

}
