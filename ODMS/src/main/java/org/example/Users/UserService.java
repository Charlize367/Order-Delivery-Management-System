package org.example.Users;

import jakarta.transaction.Transactional;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Basket.BasketService;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UsersRepository usersRepository;

    private final OrdersRepository ordersRepository;

    private final DeliveryRepository deliveryRepository;

    private final BasketRepository basketRepository;

    public UserService(UsersRepository usersRepository, OrdersRepository ordersRepository, DeliveryRepository deliveryRepository, BasketRepository basketRepository) {
        this.usersRepository = usersRepository;
        this.ordersRepository = ordersRepository;
        this.deliveryRepository = deliveryRepository;
        this.basketRepository = basketRepository;
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
    public void deleteCustomerById(Integer userId) {
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
    public void deleteDeliveryDriverById(Integer userId) {
        Users deliveryDriver = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Deliveries> deliveries = deliveryRepository.findByDeliveryMen(deliveryDriver);
        for (Deliveries delivery : deliveries) {
            delivery.setDeliveryMen(null);
            deliveryRepository.save(delivery);
        }

        usersRepository.delete(deliveryDriver);
    }

    public Users getUsersById(Integer id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }

//    public Users getUsersByRole(String role) {
//        return usersRepository.findByRole(role)
//                .orElseThrow(() -> new IllegalStateException(role + "not found"));
//    }
}
