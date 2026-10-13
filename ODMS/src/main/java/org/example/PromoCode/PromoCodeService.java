package org.example.PromoCode;


import org.example.Catalog.*;
import org.example.Category.Category;
import org.example.Exception.ResourceNotFoundException;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.PageResponse;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDate;
import java.util.List;

@Service
public class PromoCodeService {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private PromoCodeMapper promoCodeMapper;

    private static final Logger logger = LoggerFactory.getLogger(PromoCodeService.class);

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"promoCodes", "promoCode"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }

    @Caching(
            put = {
                    @CachePut(value = "promoCode", key = "#result.promoCodeId")
            },
            evict = {
                    @CacheEvict(value = "promoCodes", allEntries = true)
            }
    )
    public PromoCodeResponse createPromoCode(PromoCodeRequest request) throws IOException {
        logger.info("Attempting to add new promo code: {}", request.code());

        try {
            String safeCode = Jsoup.clean(request.code(), Safelist.none()).trim();
            String safeDescription = Jsoup.clean(request.description(), Safelist.none()).trim();


            PromoCode promoCode = new PromoCode();
            promoCode.setCode(safeCode);
            promoCode.setDiscountType(request.discountType());
            promoCode.setDiscountValue(request.discountValue());
            promoCode.setExpiryDate(request.expiryDate());
            promoCode.setStartDate(request.startDate());
            promoCode.setUsedCount(0);
            promoCode.setUsageLimit(request.usageLimit());
            promoCode.setActive(true);
            promoCode.setMinimumOrderAmount(request.minimumOrderAmount());
            promoCode.setMaximumDiscountAmount(request.maximumDiscountAmount());
            promoCode.setDescription(safeDescription);


            PromoCode savedPromo = promoCodeRepository.save(promoCode);
            logger.info("Successfully added new code : {}", request.code());
            return promoCodeMapper.toResponse(savedPromo);
        } catch (Exception e) {
            logger.error("Error creating promo code: {}", request.code(), e);
            throw new RuntimeException(e);
        }

    }

    @Cacheable(value = "promoCode", key = "#promoCodeId")
    public PromoCodeResponse getPromoCode(Long promoCodeId) {
        logger.info("Getting promo ID: {}", promoCodeId);
        PromoCode promoCode = promoCodeRepository.findById(promoCodeId)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Promo Code not found.");
                });
        logger.info("Successfully fetched promoCode ID: {}", promoCodeId);
        return promoCodeMapper.toResponse(promoCode);
    }

    @Cacheable(value = "promoCodes", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public PageResponse<PromoCodeResponse> getPromoCodes(Pageable pageable) {
        logger.info("Displaying catalogs by page");

        Page<PromoCode> page = promoCodeRepository.findAll(pageable);

        Page<PromoCodeResponse> mapped = page.map(promoCodeMapper::toResponse);

        return new PageResponse<>(mapped);
    }

    public List<PromoCodeResponse> getAllPromoCodes() {
        logger.info("Displaying all promo codes");


        return promoCodeRepository.findAll().stream()
                .map(promoCodeMapper::toResponse)
                .toList();
    }


    @Caching(
            put = {
                    @CachePut(value = "promoCode", key = "#result.promoCodeId")
            },
            evict = {
                    @CacheEvict(value = "promoCodes", allEntries = true)
            }
    )
    public PromoCodeResponse updatePromoCode(Long promoCodeId, PromoCodeRequest request) throws IOException {
        try {

            logger.info("Updating promo with ID: {}", promoCodeId);
            PromoCode promoCode = promoCodeRepository.findById(promoCodeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Promo not found with id: " + promoCodeId));



            String safeCode = Jsoup.clean(request.code(), Safelist.none()).trim();
            String safeDescription = Jsoup.clean(request.description(), Safelist.none()).trim();

            promoCode.setCode(safeCode);
            promoCode.setDiscountType(request.discountType());
            promoCode.setDiscountValue(request.discountValue());
            promoCode.setExpiryDate(request.expiryDate());
            promoCode.setStartDate(request.startDate());
            promoCode.setUsageLimit(request.usageLimit());
            promoCode.setMinimumOrderAmount(request.minimumOrderAmount());
            promoCode.setMaximumDiscountAmount(request.maximumDiscountAmount());
            promoCode.setDescription(safeDescription);


            PromoCode savedPromo =  promoCodeRepository.save(promoCode);
            logger.info("Successfully updated promo code : {}", request.code());
            return promoCodeMapper.toResponse(savedPromo);
        } catch (Exception e) {
            logger.warn("Error with promo ID: {}", promoCodeId);
            throw new RuntimeException(e);

        }
    }



    @Caching(
            put = {
                    @CachePut(value = "promoCode", key = "#result.promoCodeId")
            },
            evict = {
                    @CacheEvict(value = "promoCodes", allEntries = true)
            }
    )
    public PromoCodeResponse deactivatePromoCode(Long promoCodeId) {
        logger.info("Deactivating promo with ID: {}", promoCodeId);

        try {
            PromoCode promoCode = promoCodeRepository.findById(promoCodeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Promo not found with id: " + promoCodeId));

            promoCode.setActive(false);

            PromoCode savedPromo = promoCodeRepository.save(promoCode);
            logger.info("Successfully deactivated promo with ID : {}", promoCodeId);
            return promoCodeMapper.toResponse(savedPromo);

        } catch (Exception e) {
            // Walk the cause chain to find the real root exception
            Throwable root = e;
            while (root.getCause() != null && root.getCause() != root) {
                root = root.getCause();
            }
            logger.error("Failed to deactivate promo ID {}: {}", promoCodeId, root.getMessage(), e);
            throw e; // rethrow so your @ControllerAdvice still returns the right status
        }
    }


    @Caching(
            put = {
                    @CachePut(value = "promoCode", key = "#result.promoCodeId")
            },
            evict = {
                    @CacheEvict(value = "promoCodes", allEntries = true)
            }
    )
    public PromoCodeResponse activatePromoCode(Long promoCodeId) {
        logger.info("Activating promo with ID: {}", promoCodeId);
        PromoCode promoCode = promoCodeRepository.findById(promoCodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Promo not found with id: " + promoCodeId));

        promoCode.setActive(true);

        PromoCode savedPromo =  promoCodeRepository.save(promoCode);
        logger.info("Successfully activated promo with ID : {}", promoCodeId);
        return promoCodeMapper.toResponse(savedPromo);

    }


    public PromoValidationResponse validatePromoCode(Long promoCodeId, Long orderId) {


        PromoCode promoCode = promoCodeRepository.findById(promoCodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Promo not found with id: " + promoCodeId));

        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        BigDecimal discountValue = calculateDiscount(order.getOrder_price(), promoCode);

        PromoValidationResponse validResponse = promoCodeMapper.toValidResponse(promoCodeId, true, promoCode.getCode(), promoCode.getDiscountType(),
                promoCode.getDiscountValue(), discountValue );

        PromoValidationResponse invalidResponse = promoCodeMapper.toValidResponse(promoCodeId, false, promoCode.getCode(), promoCode.getDiscountType(),
                promoCode.getDiscountValue(), discountValue );
        if(!promoCode.isActive()) {
            return invalidResponse;
        }

       if (LocalDateTime.now().isBefore(promoCode.getStartDate())) {
           return invalidResponse;
       }

      if(LocalDateTime.now().isAfter(promoCode.getExpiryDate())) {
          return invalidResponse;
      }

      if (promoCode.getUsedCount() >= promoCode.getUsageLimit() ) {
          return invalidResponse;
      }

      if(order.getOrder_price().compareTo(promoCode.getMinimumOrderAmount()) < 0 ) {
          return invalidResponse;
      }

      if(discountValue.compareTo(promoCode.getMaximumDiscountAmount()) > 0) {
          return invalidResponse;
      }

      order.setPromoCode(promoCode);
      ordersRepository.save(order);


      return validResponse;

    }

    public BigDecimal calculateDiscount(BigDecimal subtotal, PromoCode promoCode) {

        BigDecimal discountAmount = null;
        if(promoCode.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discountAmount = promoCode.getDiscountValue();
        } else if(promoCode.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal percentage = promoCode.getDiscountValue().divide(new BigDecimal("100"));
            BigDecimal discount = subtotal.multiply(percentage);
            discountAmount = discount.setScale(2, RoundingMode.HALF_UP);
        }

        return discountAmount;
    }


    public PromoCodeResponse redeemPromoCode(Orders order, Long promoCodeId) {

        // Already redeemed for this order
        if (order.isPromoCodeRedeemed()) {
            logger.info(
                    "Promo already redeemed for order {}",
                    order.getOrderId()
            );

            return promoCodeMapper.toResponse(order.getPromoCode());
        }

        logger.info("Redeeming promo with ID: {}", promoCodeId);

        PromoCode promoCode = promoCodeRepository.findById(promoCodeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Promo not found with id: " + promoCodeId
                        )
                );

        // Make sure the promo belongs to this order
        if (order.getPromoCode() == null ||
                !promoCodeId.equals(order.getPromoCode().getPromoCodeId())) {
            throw new IllegalArgumentException(
                    "Promo code does not belong to this order"
            );
        }

        promoCode.setUsedCount(promoCode.getUsedCount() + 1);

        PromoCode savedPromo = promoCodeRepository.save(promoCode);

        // Mark this order's promo as redeemed
        order.setPromoCodeRedeemed(true);

        ordersRepository.save(order);

        logger.info(
                "Successfully redeemed promo {} for order {}",
                promoCodeId,
                order.getOrderId()
        );

        return promoCodeMapper.toResponse(savedPromo);
    }
}


