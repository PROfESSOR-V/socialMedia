package com.professor.socialMedia.controler;

import com.professor.socialMedia.entity.SiteSetting;
import com.professor.socialMedia.service.SiteSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SiteSettingController {

    @Autowired
    private SiteSettingService siteSettingService;

    @GetMapping
    public ResponseEntity<List<SiteSetting>> getAllSettings() {
        return ResponseEntity.ok(siteSettingService.getAllSettings());
    }

    @GetMapping("/{key}")
    public ResponseEntity<SiteSetting> getSettingByKey(@PathVariable String key) {
        return siteSettingService.getSettingByKey(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SiteSetting> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, Object> payload) {
        if (!payload.containsKey("value")) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(siteSettingService.saveSetting(key, payload.get("value")));
    }
}
