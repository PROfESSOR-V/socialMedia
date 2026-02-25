package com.professor.socialMedia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ShipmozoTrackingService {

    @Value("${shipmozo.public-key}")
    private String publicKey;

    @Value("${shipmozo.private-key}")
    private String privateKey;

    @Value("${shipmozo.base-url}")
    private String baseUrl;

    public Map<String, Object> track(String awb) {

        RestTemplate rest = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("public-key", publicKey);
        headers.set("private-key", privateKey);

        HttpEntity<Void> req = new HttpEntity<>(headers);

        ResponseEntity<Map> res = rest.exchange(
                baseUrl + "/track-order?awb_number=" + awb,
                HttpMethod.GET,
                req,
                Map.class);

        return res.getBody();
    }
}
