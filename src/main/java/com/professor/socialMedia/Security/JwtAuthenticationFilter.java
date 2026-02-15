package com.professor.socialMedia.Security;

import com.professor.socialMedia.service.CustomUserDetailsService;
import com.professor.socialMedia.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authToken = request.getHeader("Authorization");

        // 1. Check if token is missing or invalid format
        if (authToken == null || !authToken.startsWith("Bearer ")) {
            // Pass request down the chain without authentication (Anonymous user)
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Token is present, try to validate it
        try {
            String token = authToken.substring(7);

            Claims claims = jwtService.extractClaim(token); // If this fails, it jumps to catch
            String email = claims.getSubject();

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails user = userDetailService.loadUserByUsername(email);

                // Ideally, validate token expiration/integrity against user here if needed

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // CRITICAL: This line will show you EXACTLY why it fails in the console!
            System.out.println("JWT ERROR: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}























