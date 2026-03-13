package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Blog;
import com.professor.socialMedia.repository.BlogRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    public List<Blog> getAllPublished() {
        return blogRepository.findByPublishedTrueOrderByCreatedAtDesc();
    }

    public List<Blog> getAll() {
        return blogRepository.findAll();
    }

    public Blog getById(ObjectId id) {
        return blogRepository.findById(id).orElse(null);
    }

    public Blog create(Blog blog) {
        blog.setCreatedAt(Instant.now());
        blog.setUpdatedAt(Instant.now());
        if(blog.getSlug() == null || blog.getSlug().isEmpty()) {
            blog.setSlug(generateSlug(blog.getTitle()));
        }
        return blogRepository.save(blog);
    }

    public Blog update(ObjectId id, Blog blog) {
        Blog existing = blogRepository.findById(id).orElseThrow(() -> new RuntimeException("Blog not found"));
        existing.setTitle(blog.getTitle());
        existing.setContent(blog.getContent());
        existing.setAuthor(blog.getAuthor());
        existing.setImageUrl(blog.getImageUrl());
        existing.setPublished(blog.isPublished());
        
        if (blog.getSlug() != null && !blog.getSlug().isEmpty()) {
             existing.setSlug(blog.getSlug());
        }
        existing.setUpdatedAt(Instant.now());
        return blogRepository.save(existing);
    }

    public void delete(ObjectId id) {
        blogRepository.deleteById(id);
    }

    private String generateSlug(String title) {
        if (title == null) return "";
        return title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
