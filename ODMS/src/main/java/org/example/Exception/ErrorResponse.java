package org.example.Exception;


import org.springframework.http.HttpStatus;

public class ErrorResponse {
    private long timestamp;
    private String message;

    public ErrorResponse(long timestamp, String message, String path, HttpStatus error, int statusCode) {
        this.timestamp = timestamp;
        this.message = message;
        this.path = path;
        this.error = error;
        this.statusCode = statusCode;
    }

    private String path;
    private HttpStatus error;
    private int statusCode;


    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public HttpStatus getError() {
        return error;
    }

    public void setError(HttpStatus error) {
        this.error = error;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }
}

