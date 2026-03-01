package com.professor.socialMedia.service;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String mobileNumber)
            throws UsernameNotFoundException {
        User user = userRepository.findByMobileNumber(mobileNumber);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with mobile number: " + mobileNumber);
        }
        return new CustomUserDetail(user);
    }
}
