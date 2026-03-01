package com.professor.socialMedia.controler;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.response.AuthResponse;
import com.professor.socialMedia.dto.request.LoginRequest;
import com.professor.socialMedia.dto.request.RegistorRequest;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.service.JwtService;
import com.professor.socialMedia.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthControler {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody RegistorRequest req) {
        // Validate mobile number is exactly 10 digits
        if (req.getMobileNumber() == null || !req.getMobileNumber().matches("\\d{10}")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", "Mobile number must be exactly 10 digits."));
        }

        if (userService.findByMobileNumber(req.getMobileNumber()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("message", "An account with this mobile number already exists."));
        }

        User newUser = new User(req.getMobileNumber(), req.getPassword());
        if (req.getEmail() != null && !req.getEmail().isEmpty()) {
            newUser.setEmail(req.getEmail());
        }
        userService.createUser(newUser);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getMobileNumber(), req.getPassword()));

        CustomUserDetail user = (CustomUserDetail) auth.getPrincipal();

        User userEntity = userService.findByMobileNumber(req.getMobileNumber()).orElse(null);
        String role = userEntity != null ? userEntity.getRole().toString() : "CUSTOMER";

        return new AuthResponse(jwtService.generateToken(user), role);
    }

}
