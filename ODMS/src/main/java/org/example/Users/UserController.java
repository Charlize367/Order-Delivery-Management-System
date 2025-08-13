package org.example.Users;


import org.example.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("users")
public class UserController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    @Autowired
    UsersRepository usersRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(AuthenticationManager authenticationManager, TokenService tokenService, UserService userService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Users> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("{id}")
    public Users getUsersById(@PathVariable int id) {
        return userService.getUsersById(id);
    }

    @GetMapping("{role}")
    public Users getUsersByRole(@PathVariable String role) {
        return userService.getUsersByRole(role);
    }

    @PostMapping
    public ResponseEntity<Users> createUser(@RequestBody Users users) {
        String encodedPassword = passwordEncoder.encode(users.getPassword());
        users.setPassword(encodedPassword);
        userService.addUsers(users);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping("/register")
    public ResponseEntity<Users> register(@RequestBody Users users) {
        String encodedPassword = passwordEncoder.encode(users.getPassword());
        users.setPassword(encodedPassword);
        userService.addUsers(users);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }


    @PutMapping("/{user_ID}")
    public ResponseEntity<Users> updateUsers(@PathVariable int user_ID, @RequestBody Users users) {
        Users updateUser = userService.updateUsers(users, user_ID);
        return new ResponseEntity<>(updateUser, HttpStatus.OK);
    }

    @DeleteMapping("/{user_ID}")
    public ResponseEntity<Users> deleteUsers(@PathVariable Integer user_ID, Users users) {
        userService.deleteUsers(users, user_ID);
        return null;
    }
}
