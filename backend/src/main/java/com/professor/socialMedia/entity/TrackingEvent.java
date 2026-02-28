package com.professor.socialMedia.entity;

import lombok.Data;
import java.time.Instant;

@Data
public class TrackingEvent {
    private String status;
    private String location;
    private Instant date;
}
