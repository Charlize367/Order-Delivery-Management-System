package org.example.S3;

public class PublicImageResponse {
    private String url; // public URL of the image
    private String key; // S3 key, optional

    public PublicImageResponse(String url, String key) {
        this.url = url;
        this.key = key;
    }
}
