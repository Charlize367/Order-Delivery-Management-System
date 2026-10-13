package org.example;


import org.example.Exception.ResourceNotFoundException;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {


        Users user = usersRepository.findByUsername(email);

        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }


        return new CustomUserDetails(user);
    }



    public CustomUserDetails loadUserById(Long id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + id));

        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }


        return new CustomUserDetails(user);
    }




}
