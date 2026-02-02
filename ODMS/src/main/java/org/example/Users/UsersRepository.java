package org.example.Users;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Users findByUsername(String username);
    List<Users> getByRole(String role);
    Page<Users> findByRole(String role, Pageable pageable);
}
