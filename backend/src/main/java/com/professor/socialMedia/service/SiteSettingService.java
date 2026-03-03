package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.SiteSetting;
import com.professor.socialMedia.repository.SiteSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SiteSettingService {

    @Autowired
    private SiteSettingRepository siteSettingRepository;

    public List<SiteSetting> getAllSettings() {
        return siteSettingRepository.findAll();
    }

    public Optional<SiteSetting> getSettingByKey(String key) {
        return siteSettingRepository.findByKey(key);
    }

    public SiteSetting saveSetting(String key, Object value) {
        Optional<SiteSetting> existingOpt = siteSettingRepository.findByKey(key);
        SiteSetting setting = existingOpt.orElse(new SiteSetting());
        setting.setKey(key);
        setting.setValue(value);
        return siteSettingRepository.save(setting);
    }
}
