package org.example;

import org.springframework.data.domain.Page;

import java.util.List;

public class PageResponse<T> {

    private List<T> content;
    private int number;
    private int pageSize;
    private long totalElements;
    private int totalPages;

    public PageResponse() {

    }

    public PageResponse(Page<T> pageData) {
        this.content = pageData.getContent();
        this.number = pageData.getNumber();
        this.pageSize = pageData.getSize();
        this.totalElements = pageData.getTotalElements();
        this.totalPages = pageData.getTotalPages();

    }


    public List<T> getContent() { return content; }
    public void setContent(List<T> content) { this.content = content; }

    public int getNumber() { return number; }
    public void setNumber(int number) {
    }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }


}
