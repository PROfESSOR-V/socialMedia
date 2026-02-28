package com.professor.socialMedia.entity;

import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class ShipmentInfo {
    private String shipmentId;
    private String awb;
    private String courier;

    private String currentStatus;
    private String orderStatus;

    private Instant statusTime;
    private Instant expectedDeliveryDate;

    private Instant lastSyncedAt;

    private List<TrackingEvent> timeline;
}
