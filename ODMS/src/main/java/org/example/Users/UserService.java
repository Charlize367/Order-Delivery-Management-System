package org.example.Users;

import org.example.Orders.Orders;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UsersRepository usersRepository;

    public UserService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    public void addUsers(Users users) {
        usersRepository.save(users);
    }


    public Users updateUsers(Users users, Integer id) {
        Optional<Users> user = usersRepository.findById(id);
        if (user.isPresent()) {
            usersRepository.save(users);
        }
        else {
            return null;
        }
        return users;
    }

    public void deleteUsers(Users users, Integer id) {
        Optional<Users> user = usersRepository.findById(id);
        if (user.isPresent()) {
            usersRepository.delete(users);
        }
        else {
            return;
        }
    }

    public Users getUsersById(Integer id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }

    public Users getUsersByRole(String role) {
        return usersRepository.findByRole(role)
                .orElseThrow(() -> new IllegalStateException(role + "not found"));
    }
}
