package com.makemytrip.makemytrip.models;

import java.util.Date;
import java.util.UUID;

public class ReviewReply {
    private String id;
    private String userId;
    private String userName;
    private String text;
    private Date createdAt;

    public ReviewReply() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = new Date();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}