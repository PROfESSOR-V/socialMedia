package com.professor.socialMedia.entity;

import lombok.Data;

@Data
public class Address {
    private String name;
    private String phoneNumber;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String country;
}
