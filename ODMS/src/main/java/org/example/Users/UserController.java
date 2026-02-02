package org.example.Users;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/users")
public class UserController {

    @Autowired
    UsersRepository usersRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private UserMapper userMapper;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/all")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getUsers(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "5") int size,
                                                                @RequestParam(defaultValue = "userId") String sortBy,
                                                                @RequestParam(required = false) String role,
                                                                @RequestParam(defaultValue = "true") boolean descending) {
        Sort sort = descending ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);


        return ResponseEntity.ok(userService.getUsers(role, pageable));
    }

    @GetMapping("{id}")
    public UserResponse getUsersById(@PathVariable long id) {
        return userService.getUsersById(id);
    }

    @GetMapping("/role/{role}")
    public List<UserResponse> getUsersByRole(@PathVariable String role) {
        return usersRepository.getByRole(role)
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Validated @RequestBody UserRequest request) {
        UserResponse newUser = userService.createUser(request);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    @PostMapping("/admin")
    public ResponseEntity<UserResponse> createAdmin(@Validated @RequestBody UserRequest request) {
        UserResponse admin = userService.createAdmin(request);
        return new ResponseEntity<>(admin, HttpStatus.CREATED);
    }



    @PutMapping("/{user_ID}")
    public ResponseEntity<UserResponse> updateUsers(@Validated @PathVariable long userId, @RequestBody UserRequest request) {
        UserResponse updateUser = userService.updateUsers(userId, request);
        return new ResponseEntity<>(updateUser, HttpStatus.OK);
    }

    @DeleteMapping("/customers/{user_ID}")
    public ResponseEntity<UserResponse> deleteCustomers(@PathVariable Long user_ID) {
        userService.deleteCustomerById(user_ID);
        return null;
    }

    @DeleteMapping("/delivery/{user_ID}")
    public ResponseEntity<UserResponse> deleteDeliveryDriver(@PathVariable Long user_ID) {
        userService.deleteDeliveryDriverById(user_ID);
        return null;
    }
}
