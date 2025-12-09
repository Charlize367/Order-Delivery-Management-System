package org.example.Users;

import jakarta.transaction.Transactional;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Basket.BasketService;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private BasketRepository basketRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;



    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    public Users createUser(Users users) {
        String encodedPassword = passwordEncoder.encode(users.getPassword());
        users.setPassword(encodedPassword);
        users.setEnabled(true);
        return usersRepository.save(users);
    }

    public Users createAdmin(Users users) {
        String encodedPassword = passwordEncoder.encode(users.getPassword());
        users.setPassword(encodedPassword);
        users.setEnabled(true);
        users.setRole("ADMIN");
        return usersRepository.save(users);
    }


    public Users updateUsers(Users users, Long id) {
        Optional<Users> user = usersRepository.findById(id);
        if (user.isPresent()) {
            usersRepository.save(users);
        }
        else {
            return null;
        }
        return users;
    }

//    public void deleteUsers(Users users, Integer id) {
//        Optional<Users> user = usersRepository.findById(id);
//        if (user.isPresent()) {
//            usersRepository.delete(users);
//        }
//        else {
//            return;
//        }
//    }


    @Transactional
    public void deleteCustomerById(Long userId) {
        Users customer = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Orders> orders = ordersRepository.findByCustomer(customer);
        for (Orders order : orders) {
            order.setCustomer(null);
            ordersRepository.save(order);
        }

        List <Basket> basket = basketRepository.findByCustomer(customer);
        for(Basket baskets : basket) {
            baskets.setCustomer(null);
            basketRepository.save(baskets);
        }

        usersRepository.delete(customer);

    }

    @Transactional
    public void deleteDeliveryDriverById(Long userId) {
        Users deliveryDriver = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Deliveries> deliveries = deliveryRepository.findByDeliveryMen(deliveryDriver);
        for (Deliveries delivery : deliveries) {
            delivery.setDeliveryMen(null);
            deliveryRepository.save(delivery);
        }

        usersRepository.delete(deliveryDriver);
    }

    public Users getUsersById(Long id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }

//    public Users getUsersByRole(String role) {
//        return usersRepository.findByRole(role)
//                .orElseThrow(() -> new IllegalStateException(role + "not found"));
//    }
}


