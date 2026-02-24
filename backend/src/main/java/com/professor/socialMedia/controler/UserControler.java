package com.professor.socialMedia.controler;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.UserDto;
import com.professor.socialMedia.dto.mapper.UserMapper;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserControler {

    @Autowired
    private UserService userService;
    @Autowired
    private UserMapper userMapper;

    /**
     * Get current authenticated user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal CustomUserDetail user) {
        User userEntity = userService.findByEmail(user.getUsername()).orElse(null);
        if (userEntity == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("User Profile Not Found"));
        }
        UserDto userDto = userMapper.mapUser(userEntity);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userDto));
    }

    /**
     * Get all users - ADMIN only
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", userService.findAll()));
    }

    /**
     * Get user by ID - ADMIN only
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable ObjectId id) {
        User user = userService.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found"));
        }

        UserDto userDto = userMapper.mapUser(user);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", userDto));
    }

    /**
     * Update current user's own profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal CustomUserDetail user,
            @RequestBody UserDto updateRequest) {

        User userEntity = userService.findByEmail(user.getUsername()).orElse(null);
        if (userEntity == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found"));
        }

        // Only allow updating own profile
        if (updateRequest.getName() != null) {
            userEntity.setName(updateRequest.getName());
        }
        if (updateRequest.getMobileNumber() != null) {
            userEntity.setMobileNumber(updateRequest.getMobileNumber());
        }
        if (updateRequest.getAddresses() != null) {
            userEntity.setAddresses(updateRequest.getAddresses());
        }

        User updated = userService.updateUser(userEntity);
        UserDto userDto = userMapper.mapUser(updated);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userDto));
    }

    /**
     * Delete current user's account
     */
    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> deleteCurrentUserAccount(
            @AuthenticationPrincipal CustomUserDetail user) {

        User userEntity = userService.findByEmail(user.getUsername()).orElse(null);
        if (userEntity == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found"));
        }

        userService.deleteById(userEntity.getId());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully", null));
    }

}
