package org.example.Users;


import org.example.PageResponse;
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
    public ResponseEntity<PageResponse<UserResponse>> getUsers(@RequestParam(defaultValue = "0") int page,
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

    @GetMapping("/driver/{deliveryId}")
    public UserResponse getDriverByDeliveryId(@PathVariable long deliveryId) {
        return userService.getDriverByDelivery(deliveryId);
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



    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUsers(@Validated @PathVariable long userId, @RequestBody UserRequest request) {
        UserResponse updateUser = userService.updateUsers(userId, request);
        return new ResponseEntity<>(updateUser, HttpStatus.OK);
    }

    @DeleteMapping("/customers/{userId}")
    public ResponseEntity<UserResponse> deleteCustomers(@PathVariable Long userId) {
        userService.deleteCustomerById(userId);
        return null;
    }

    @DeleteMapping("/delivery/{userId}")
    public ResponseEntity<UserResponse> deleteDeliveryDriver(@PathVariable Long userId) {
        userService.deleteDeliveryDriverById(userId);
        return null;
    }

    @DeleteMapping("/kitchen/{userId}")
    public ResponseEntity<UserResponse> deleteKitchenStaff(@PathVariable Long userId) {
        userService.deleteKitchenStaffById(userId);
        return null;
    }


    @DeleteMapping("/dispatcher/{userId}")
    public ResponseEntity<UserResponse> deleteDispatcher(@PathVariable Long userId) {
        userService.deleteKitchenStaffById(userId);
        return null;
    }
}
