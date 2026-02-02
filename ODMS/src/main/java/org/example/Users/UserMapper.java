package org.example.Users;


import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public Users toEntity(UserRequest req) {
        Users user = new Users();
        user.setUsername(req.getUsername());
        user.setPassword(req.getPassword());
        user.setRole(req.getRole());
        user.setEnabled(true);
        return user;
    }

    public UserResponse toResponse(Users user) {
        UserResponse userResponse = new UserResponse();
        userResponse.setUserId(user.getUserId());
        userResponse.setUsername(user.getUsername());
        userResponse.setPassword(user.getPassword());
        userResponse.setRole(user.getRole());
        return userResponse;
    }
}
