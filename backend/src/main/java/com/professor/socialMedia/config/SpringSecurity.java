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
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SpringSecurity {

        @Autowired
        private JwtAuthenticationFilter jwtFilter;

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(
                        "http://localhost:3000",
                        "https://social-media-ecom.vercel.app",
                        "https://aurelynbeauty.com",
                        "https://www.aurelynbeauty.com"
                ));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // PUBLIC ENDPOINTS
                                                .requestMatchers(
                                                                org.springframework.http.HttpMethod.GET, "/api/settings/**"
                                                ).permitAll()
                                                .requestMatchers(
                                                                org.springframework.http.HttpMethod.GET, "/api/testvideos", "/api/testvideos/**", "/api/blogs", "/api/blogs/**"
                                                ).permitAll()
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

                                                .requestMatchers("/api/coupons/apply", "/api/coupons/active")
                                                .authenticated()

                                                .requestMatchers("/api/payment/order")
                                                .authenticated()

                                                // ADMIN ENDPOINTS
                                                .requestMatchers("/api/products/**", "/api/categories/**",
                                                                "/api/order/admin/**", "/api/upload",
                                                                "/api/admin/**", "/api/settings",
                                                                "/api/testvideos/**")
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
