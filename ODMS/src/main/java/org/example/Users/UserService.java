package org.example.Users;

import jakarta.transaction.Transactional;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Catalog.Catalog;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.Exception.ResourceNotFoundException;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Autowired
    private UserMapper userMapper;

    private static final Logger logger = LoggerFactory.getLogger(Catalog.class);

    public List<UserResponse> getAllUsers() {
        logger.info("Displaying all users");
        return usersRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    public Page<UserResponse> getUsers(String role, Pageable pageable) {
        logger.info("Displaying users by page");

        if(role != null) {
            return usersRepository.findByRole(role, pageable)
                    .map(userMapper::toResponse);
        }
        return usersRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }

    public UserResponse createUser(UserRequest request) {
        logger.info("Attempting to add new user with name: {}", request.getUsername());
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        String safeName = Jsoup.clean(request.getUsername(), Safelist.none()).trim();
        String safeRole = Jsoup.clean(request.getRole(), Safelist.none()).trim();

        Users newUser = new Users();
        newUser.setUsername(safeName);
        newUser.setPassword(encodedPassword);
        newUser.setRole(safeRole);
        newUser.setEnabled(true);
        Users savedUser = usersRepository.save(newUser);
        logger.info("Successfully added new user with name: {}", request.getUsername());
        return userMapper.toResponse(savedUser);
    }

    public UserResponse createAdmin(UserRequest request) {
        logger.info("Attempting to add new admin with name: {}", request.getUsername());
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Users newUser = new Users();
        String safeName = Jsoup.clean(request.getUsername(), Safelist.none()).trim();
        newUser.setUsername(safeName);
        newUser.setPassword(encodedPassword);
        newUser.setEnabled(true);
        newUser.setRole("ADMIN");
        Users savedUser = usersRepository.save(newUser);
        logger.info("Successfully added new admin with name: {}", request.getUsername());
        return userMapper.toResponse(savedUser);
    }


    public UserResponse updateUsers(Long id, UserRequest request) {
        logger.info("Updating user with ID: {}", id);
        Optional<Users> user = usersRepository.findById(id);

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        String safeName = Jsoup.clean(request.getUsername(), Safelist.none()).trim();
        Users savedUser;

        Users updateUser = usersRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        updateUser.setUserId(id);
        updateUser.setUsername(safeName);
        updateUser.setEnabled(true);
        updateUser.setRole(request.getRole());
        updateUser.setPassword(encodedPassword);


        if (user.isPresent()) {
            savedUser = usersRepository.save(updateUser);

        } else {
            return null;
        }
        logger.info("Successfully updated user with ID: {}", id);
        return userMapper.toResponse(savedUser);
    }


    @Transactional
    public void deleteCustomerById(Long userId) {
        logger.info("Deleting customer ID: {}", userId);
        Users customer = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Orders> orders = ordersRepository.findByCustomer(customer);
        for (Orders order : orders) {
            order.setCustomer(null);
            ordersRepository.save(order);
        }

        List<Basket> basket = basketRepository.findByCustomer(customer);
        for (Basket baskets : basket) {
            baskets.setCustomer(null);
            basketRepository.save(baskets);
        }


        usersRepository.delete(customer);
        logger.info("Successfully deleted customer ID: {}", userId);

    }

    @Transactional
    public void deleteDeliveryDriverById(Long userId) {
        logger.info("Deleting delivery driver ID: {}", userId);
        Users deliveryDriver = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Deliveries> deliveries = deliveryRepository.getByDeliveryMen(deliveryDriver);
        for (Deliveries delivery : deliveries) {
            delivery.setDeliveryMen(null);
            deliveryRepository.save(delivery);
        }

        usersRepository.delete(deliveryDriver);
        logger.info("Successfully deleted delivery driver ID: {}", userId);
    }


    @Cacheable("users")
    public UserResponse getUsersById(Long id) {
        logger.info("Getting user ID: {}", id);
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("User not found.");
                });
        logger.info("Successfully fetched user ID: {}", id);
        return userMapper.toResponse(user);
    }
}




