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
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        try{
            User user = userRepository.findByEmail(email);
            return new CustomUserDetail(user);
        }catch(UsernameNotFoundException e){
            throw new UsernameNotFoundException(e.getMessage());
        }
    }
}

