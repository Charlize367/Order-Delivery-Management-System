package org.example.S3;


public class PresignedUrlResponse {

    public PresignedUrlResponse(String uploadUrl, String key) {
        this.uploadUrl = uploadUrl;
        this.key = key;
    }

    public String getUploadUrl() {
        return uploadUrl;
    }

    public void setUploadUrl(String uploadUrl) {
        this.uploadUrl = uploadUrl;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    private String uploadUrl;
    private String key;
}

