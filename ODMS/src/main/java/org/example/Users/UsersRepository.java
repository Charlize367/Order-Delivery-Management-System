package org.example.Users;

import org.example.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Users findByUsername(String username);
    List<Users> findByRole(String role);
}
