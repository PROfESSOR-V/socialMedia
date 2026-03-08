package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.TestVideo;
import com.professor.socialMedia.repository.TestVideoRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Service
public class TestVideoService {

    @Autowired
    private TestVideoRepository testVideoRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<TestVideo> getAllVideos() {
        return testVideoRepository.findAll();
    }

    public TestVideo uploadVideo(String videoName, MultipartFile file) throws IOException {
        String videoUrl = cloudinaryService.uploadVideo(file);

        TestVideo testVideo = new TestVideo();
        testVideo.setVideoName(videoName);
        testVideo.setVideoUrl(videoUrl);
        testVideo.setCreatedAt(Instant.now());
        testVideo.setUpdatedAt(Instant.now());

        return testVideoRepository.save(testVideo);
    }

    public void deleteVideo(ObjectId id) {
        testVideoRepository.deleteById(id);
    }
}
