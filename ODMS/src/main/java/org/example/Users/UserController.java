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

    @Autowired
    UsersRepository usersRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Users> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("{id}")
    public Users getUsersById(@PathVariable long id) {
        return userService.getUsersById(id);
    }

    @GetMapping("/role/{role}")
    public List<Users> getUsersByRole(@PathVariable String role) {
        return usersRepository.findByRole(role);
    }

    @PostMapping
    public ResponseEntity<Users> createUser(@RequestBody Users users) {
        Users newUser = userService.createUser(users);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    @PostMapping("/admin")
    public ResponseEntity<Users> createAdmin(@RequestBody Users users) {
        Users admin = userService.createAdmin(users);
        return new ResponseEntity<>(admin, HttpStatus.CREATED);
    }

    @PostMapping("/register")
    public ResponseEntity<Users> register(@RequestBody Users users) {
        Users newUser = userService.createUser(users);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    @PutMapping("/{user_ID}")
    public ResponseEntity<Users> updateUsers(@PathVariable long userId, @RequestBody Users users) {
        Users updateUser = userService.updateUsers(users, userId);
        return new ResponseEntity<>(updateUser, HttpStatus.OK);
    }

    @DeleteMapping("/customers/{user_ID}")
    public ResponseEntity<Users> deleteCustomers(@PathVariable Long user_ID) {
        userService.deleteCustomerById(user_ID);
        return null;
    }

    @DeleteMapping("/delivery/{user_ID}")
    public ResponseEntity<Users> deleteDeliveryDriver(@PathVariable Long user_ID) {
        userService.deleteDeliveryDriverById(user_ID);
        return null;
    }
}
