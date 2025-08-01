package org.example.Users;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("users")
public class UserController {

    @Autowired
    UsersRepository usersRepository;
    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<Users> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("{id}")
    public Users getUsersById(@PathVariable int id) {
        return userService.getUsersById(id);
    }

    @PostMapping
    public ResponseEntity<Users> createUser(@RequestBody Users users) {
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
