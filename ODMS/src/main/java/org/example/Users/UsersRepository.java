package org.example.Users;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Users findByUsername(String username);
    List<Users> getByRole(String role);
    Optional<Users> getUserByRole(String role);

    Page<Users> findByRole(String role, Pageable pageable);
}
