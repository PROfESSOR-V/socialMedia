package com.professor.socialMedia.controler;

import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Blog;
import com.professor.socialMedia.service.BlogService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BlogController {

    @Autowired
    private BlogService blogService;

    // Public API endpoints
    @GetMapping("/blogs")
    public ResponseEntity<ApiResponse<List<Blog>>> getPublishedBlogs() {
        return ResponseEntity.ok(ApiResponse.success("Blogs fetched successfully", blogService.getAllPublished()));
    }

    @GetMapping("/blogs/{id}")
    public ResponseEntity<ApiResponse<Blog>> getBlogById(@PathVariable String id) {
        Blog blog = blogService.getById(new ObjectId(id));
        if (blog != null && blog.isPublished()) {
            return ResponseEntity.ok(ApiResponse.success("Blog fetched successfully", blog));
        }
        return ResponseEntity.notFound().build();
    }

    // Admin API endpoints
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/blogs")
    public ResponseEntity<ApiResponse<List<Blog>>> getAllBlogsAdmin() {
         return ResponseEntity.ok(ApiResponse.success("Blogs fetched successfully", blogService.getAll()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/blogs/{id}")
    public ResponseEntity<ApiResponse<Blog>> getBlogByIdAdmin(@PathVariable String id) {
        Blog blog = blogService.getById(new ObjectId(id));
        if (blog != null) {
            return ResponseEntity.ok(ApiResponse.success("Blog fetched successfully", blog));
        }
        return ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/blogs")
    public ResponseEntity<ApiResponse<Blog>> createBlog(@RequestBody Blog blog) {
        return ResponseEntity.ok(ApiResponse.success("Blog created successfully", blogService.create(blog)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/blogs/{id}")
    public ResponseEntity<ApiResponse<Blog>> updateBlog(@PathVariable String id, @RequestBody Blog blog) {
        return ResponseEntity.ok(ApiResponse.success("Blog updated successfully", blogService.update(new ObjectId(id), blog)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/blogs/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBlog(@PathVariable String id) {
        blogService.delete(new ObjectId(id));
        return ResponseEntity.ok(ApiResponse.success("Blog deleted successfully", null));
    }
}
