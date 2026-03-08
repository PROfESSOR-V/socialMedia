package com.professor.socialMedia.controler;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.response.AuthResponse;
import com.professor.socialMedia.dto.request.LoginRequest;
import com.professor.socialMedia.dto.request.RegistorRequest;
import com.professor.socialMedia.dto.request.SendOtpRequest;
import com.professor.socialMedia.dto.request.VerifyOtpRequest;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.service.JwtService;
import com.professor.socialMedia.service.OtpService;
import com.professor.socialMedia.service.UserService;
import com.professor.socialMedia.service.WhatsAppOtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthControler {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private OtpService otpService;

    @Autowired
    private WhatsAppOtpService whatsAppOtpService;

    // -----------------------------------------------------------------------
    // STEP 1 — Send OTP
    // -----------------------------------------------------------------------

    /**
     * POST /auth/send-otp
     * Validates the phone number, generates an OTP, stores it with expiry,
     * and sends it to the user's WhatsApp via MSG91.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody SendOtpRequest req) {
        String phone = req.getPhone();

        if (phone == null || !phone.matches("\\d{10}")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please enter a valid 10-digit mobile number."));
        }

        try {
            String otp = otpService.generateAndSave(phone);
            whatsAppOtpService.sendOtp(phone, otp);
            return ResponseEntity.ok(Map.of("message", "OTP sent to your WhatsApp number."));
        } catch (RuntimeException ex) {
            // Rate-limit or MSG91 failure
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // STEP 2 — Verify OTP
    // -----------------------------------------------------------------------

    /**
     * POST /auth/verify-otp
     * Verifies the 6-digit OTP entered by the user.
     * On success, marks the phone as verified in the OTP record.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest req) {
        String phone = req.getPhone();
        String otp = req.getOtp();

        if (phone == null || !phone.matches("\\d{10}")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid phone number."));
        }

        if (otp == null || !otp.matches("\\d{6}")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "OTP must be a 6-digit number."));
        }

        try {
            otpService.verifyOtp(phone, otp);
            return ResponseEntity.ok(Map.of("verified", true, "message", "Mobile number verified successfully."));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("verified", false, "message", ex.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // STEP 3 — Signup (only allowed after OTP verification)
    // -----------------------------------------------------------------------

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody RegistorRequest req) {

        if (req.getMobileNumber() == null || !req.getMobileNumber().matches("\\d{10}")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Mobile number must be exactly 10 digits."));
        }

        // Guard: ensure the phone number was OTP-verified before allowing signup
        if (!otpService.isPhoneVerified(req.getMobileNumber())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Mobile number is not verified. Please complete OTP verification first."));
        }

        if (userService.findByMobileNumber(req.getMobileNumber()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with this mobile number already exists."));
        }

        User newUser = new User(req.getMobileNumber(), req.getPassword());
        if (req.getEmail() != null && !req.getEmail().isEmpty()) {
            newUser.setEmail(req.getEmail());
        }
        userService.createUser(newUser);

        // Clean up OTP record — phone is now registered, no longer needed
        otpService.deleteRecord(req.getMobileNumber());

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    // -----------------------------------------------------------------------
    // Login
    // -----------------------------------------------------------------------

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getMobileNumber(), req.getPassword()));

            CustomUserDetail user = (CustomUserDetail) auth.getPrincipal();
            User userEntity = userService.findByMobileNumber(req.getMobileNumber()).orElse(null);
            String role = userEntity != null ? userEntity.getRole().toString() : "CUSTOMER";

            return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(user), role));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid mobile number or password"));
        }
    }
}
