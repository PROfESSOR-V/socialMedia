package com.professor.socialMedia.config;

import com.professor.socialMedia.Security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SpringSecurity {

        @Autowired
        private JwtAuthenticationFilter jwtFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

                http
                                .cors(org.springframework.security.config.Customizer.withDefaults())
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // PUBLIC ENDPOINTS
                                                .requestMatchers(
                                                                "/auth/**",
                                                                "/api/products",
                                                                "/api/products/{id}",
                                                                "/api/categories",
                                                                "/api/payments/webhook",
                                                                "/api/feedback",
                                                                "/health")
                                                .permitAll()

                                                // AUTHENTICATED ENDPOINTS
                                                .requestMatchers("/api/user/profile/**")
                                                .authenticated()

                                                .requestMatchers("/api/cart/", "/api/cart/**")
                                                .authenticated()

                                                .requestMatchers("/api/orders/{id}", "/api/order")
                                                .authenticated()

                                                .requestMatchers("/api/payment/order")
                                                .authenticated()

                                                // ADMIN ENDPOINTS
                                                .requestMatchers("/api/products/**", "/api/categories/**",
                                                                "/api/order/admin/**", "/api/upload")
                                                .hasRole("ADMIN")

                                                // ALL OTHER REQUESTS MUST BE AUTHENTICATED
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration auth) throws Exception {
                return auth.getAuthenticationManager();
        }
}
