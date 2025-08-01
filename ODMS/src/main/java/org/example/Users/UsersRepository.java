package org.example.Users;

import org.example.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UsersRepository extends JpaRepository<Users, Integer> {
}
